# -*- coding: utf-8 -*-
"""
Daily AI News - static site generator (JST)
- Summaries are translated to Japanese (no API key) using deep-translator.
- Primary engine: GoogleTranslator (unofficial). Fallback: MyMemory (ja-JP).
- Caches translations to _cache/translations.json to avoid repeated calls.
- Reads RSS list from feeds.yml with categories: Business, Tools, Posts.
- Injects X posts from a CSV file into the 'Posts' category.

Env (optional):
  HOURS_LOOKBACK=24        # Fetch window in hours
  MAX_ITEMS_PER_CATEGORY=8 # Max cards per tab
  TRANSLATE_TO_JA=1        # 1=enable JA summaries, 0=disable
  TRANSLATE_ENGINE=google  # google|mymemory
  X_POSTS_CSV=_sources/x_favorites.csv # Path to X posts CSV
  TZ=Asia/Tokyo            # for timestamps
"""
import os, re, sys, json, time, html, csv, io, textwrap
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen

import yaml
import feedparser
import requests
import random

# ---------------- Mojibake Repair Utilities ----------------
def repair_mojibake(text: str) -> str:
    """Attempt to repair common mojibake (garbled) text.
    Tries several re-encode/decode strategies and picks the one with more Japanese characters
    and fewer replacement characters. Always returns normalized (NFKC) single-line text.
    """
    if not text:
        return text
    try:
        import unicodedata, re
        candidates = [text]
        # Try common mis-decode patterns
        try:
            candidates.append(bytes(text, 'latin-1', errors='ignore').decode('utf-8', errors='ignore'))
        except Exception:
            pass
        try:
            candidates.append(bytes(text, 'cp1252', errors='ignore').decode('utf-8', errors='ignore'))
        except Exception:
            pass
        try:
            candidates.append(bytes(text, 'latin-1', errors='ignore').decode('cp932', errors='ignore'))
        except Exception:
            pass
        try:
            candidates.append(bytes(text, 'cp932', errors='ignore').decode('utf-8', errors='ignore'))
        except Exception:
            pass

        def score(t: str) -> int:
            jp = sum(1 for ch in t if ('\u3040' <= ch <= '\u30ff') or ('\u4e00' <= ch <= '\u9fff'))
            bad = t.count('\ufffd') + t.count('�')
            ctrl = sum(1 for ch in t if ord(ch) < 32 and ch not in '\n\r\t')
            return jp * 2 - bad * 2 - ctrl

        best = max(candidates, key=score)
        best = unicodedata.normalize('NFKC', best)
        # Replace common broken punctuation
        for k, v in {
            'â€“': '–', 'â€”': '—', 'â€˜': "'", 'â€™': "'",
            'â€œ': '"', 'â€': '"', 'â€¢': '•', 'â€¦': '…'
        }.items():
            best = best.replace(k, v)
        best = re.sub(r"\s+", " ", best).strip()
        return best
    except Exception:
        return text
# Enhanced X Processing Integration
try:
    from enhanced_x_processor import EnhancedXProcessor
    ENHANCED_X_AVAILABLE = True
    print("✅ Enhanced X Processor: Integrated")
except ImportError:
    ENHANCED_X_AVAILABLE = False
    print("⚠️ Enhanced X Processor: Using fallback")

import time
from urllib.parse import urljoin

# URL フィルター機能をインポート
try:
    from url_filter import filter_403_urls, is_403_url
    print("✅ URL フィルター機能: 有効")
except ImportError:
    print("⚠️ URL フィルター機能: 無効")
    def filter_403_urls(items):
        return items
    def is_403_url(url):
        return False

# ---------- config (改善版) ----------
def get_config():
    """設定読み込み（改善版）"""
    config = {
        'hours_lookback': int(os.getenv("HOURS_LOOKBACK", "24")),
        'max_items_per_category': int(os.getenv("MAX_ITEMS_PER_CATEGORY", "8")),
        'translate_to_ja': os.getenv("TRANSLATE_TO_JA", "1") == "1",
        'translate_engine': os.getenv("TRANSLATE_ENGINE", "google").lower(),
        'x_posts_csv': os.getenv("X_POSTS_CSV", ""),
        'gemini_api_key': os.getenv("GEMINI_API_KEY", ""),
        'debug_mode': os.getenv("DEBUG_MODE", "0") == "1"
    }

    # X投稿CSVのデフォルト値
    if not config['x_posts_csv']:
        config['x_posts_csv'] = "https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0"

    # 設定値の検証
    if config['hours_lookback'] < 1 or config['hours_lookback'] > 168:  # 1時間～1週間
        print(f"[WARN] Invalid HOURS_LOOKBACK: {config['hours_lookback']}, using default 24")
        config['hours_lookback'] = 24

    if config['max_items_per_category'] < 1 or config['max_items_per_category'] > 20:
        print(f"[WARN] Invalid MAX_ITEMS_PER_CATEGORY: {config['max_items_per_category']}, using default 8")
        config['max_items_per_category'] = 8

    # デバッグモード表示
    if config['debug_mode']:
        print("[DEBUG] Debug mode enabled")

    return config

# 設定読み込み
CONFIG = get_config()

# グローバル変数設定
HOURS_LOOKBACK = CONFIG['hours_lookback']
MAX_ITEMS_PER_CATEGORY = CONFIG['max_items_per_category']
TRANSLATE_TO_JA = CONFIG['translate_to_ja']
TRANSLATE_ENGINE = CONFIG['translate_engine']
X_POSTS_CSV = CONFIG['x_posts_csv']

JST = timezone(timedelta(hours=9))
NOW = datetime.now(JST)

CACHE_DIR = Path("_cache")
CACHE_DIR.mkdir(exist_ok=True)
CACHE_FILE = CACHE_DIR / "translations.json"

def load_cache():
    """キャッシュ読み込み（改善版）"""
    try:
        if CACHE_FILE.exists():
            cache_data = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
            cache_size = len(cache_data)
            print(f"[INFO] Loaded cache with {cache_size} entries")
            return cache_data
        else:
            print("[INFO] No cache file found, starting fresh")
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        print(f"[WARN] Cache file corrupted: {e}")
    except Exception as e:
        print(f"[ERROR] Failed to load cache: {e}")
    return {}

def save_cache(cache):
    """キャッシュ保存（改善版）"""
    backup_file = None
    try:
        CACHE_DIR.mkdir(exist_ok=True)

        # キャッシュサイズチェック
        cache_size = len(cache)
        if cache_size > 10000:  # 10,000エントリ以上は警告
            print(f"[WARN] Large cache detected ({cache_size} entries)")

        # バックアップ作成
        if CACHE_FILE.exists():
            backup_file = CACHE_FILE.with_suffix('.json.backup')
            CACHE_FILE.rename(backup_file)

        # 新しいキャッシュを保存
        CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

        # 保存確認
        saved_size = len(json.loads(CACHE_FILE.read_text(encoding="utf-8")))
        if saved_size == cache_size:
            print(f"[SUCCESS] Cache saved with {cache_size} entries")
        else:
            print(f"[WARN] Cache size mismatch: expected {cache_size}, got {saved_size}")

        # 古いバックアップ削除
        if backup_file and backup_file.exists():
            backup_file.unlink()

    except Exception as e:
        print(f"[ERROR] Failed to save cache: {e}")
        # バックアップから復元
        if backup_file and backup_file.exists():
            backup_file.rename(CACHE_FILE)
            print("[INFO] Restored cache from backup")

def advanced_feed_fetch(url, name):
    """高度なHTTPリクエストでフィード取得 - Google News 403エラー対策"""
    
    # 複数のUser-Agentを用意
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
    ]
    
    for i, user_agent in enumerate(user_agents):
        try:
            print(f"[INFO] Advanced fetch attempt {i+1}/{len(user_agents)} for {name}")
            
            # セッションを作成して詳細ヘッダーを設定
            session = requests.Session()
            session.headers.update({
                'User-Agent': user_agent,
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            })
            
            # Google NewsまたはGoogle系のURLの場合、追加のヘッダーを設定
            if 'google.com' in url or 'news.google.com' in url:
                session.headers.update({
                    'Referer': 'https://news.google.com/',
                    'Origin': 'https://news.google.com',
                    'Sec-Fetch-User': '?1'
                })
            
            # Google系サービスの場合、追加の遅延
            if 'google.com' in url:
                delay = random.uniform(2, 5)  # 2-5秒のランダム遅延
                print(f"[INFO] Google service detected, applying {delay:.1f}s delay")
                time.sleep(delay)
            
            # リクエスト実行
            response = session.get(url, timeout=30, allow_redirects=True)
            
            if response.status_code == 200:
                print(f"[SUCCESS] {name} fetched successfully with User-Agent {i+1}")
                # feedparserに渡すためにBytesIOオブジェクトを作成
                import io
                feed_data = io.BytesIO(response.content)
                d = feedparser.parse(feed_data)
                return d
            elif response.status_code == 403:
                print(f"[WARN] 403 Forbidden with User-Agent {i+1} for {name}")
                continue
            else:
                print(f"[WARN] HTTP {response.status_code} with User-Agent {i+1} for {name}")
                continue
                
        except Exception as e:
            print(f"[WARN] Exception with User-Agent {i+1} for {name}: {e}")
            continue
    
    print(f"[ERROR] All advanced fetch attempts failed for {name}")
    
    # 最後の手段: Gemini Web Fetcherを使用
    try:
        from gemini_web_fetcher import GeminiWebFetcher
        fetcher = GeminiWebFetcher()
        if fetcher.analyzer.enabled:
            print(f"[INFO] Trying Gemini Web Fetcher for {name}...")
            news_items = fetcher.fetch_from_problematic_source(url, name)
            if news_items:
                # feedparserライクなオブジェクトを作成
                fake_feed = type('FakeFeed', (), {})()
                fake_feed.entries = []
                
                for item in news_items:
                    entry = type('FakeEntry', (), {})()
                    entry.title = item.get('title', '')
                    entry.summary = item.get('summary', '')
                    entry.link = item.get('url', '#')
                    entry.published_parsed = item.get('_dt', datetime.now()).timetuple()
                    fake_feed.entries.append(entry)
                
                print(f"[SUCCESS] Gemini fetched {len(news_items)} items for {name}")
                return fake_feed
    except ImportError:
        print(f"[WARN] Gemini Web Fetcher not available")
    except Exception as e:
        print(f"[WARN] Gemini Web Fetcher failed: {e}")
    
    return None

# ---------- translation ----------
def looks_japanese(s: str) -> bool:
    if not s:
        return False
    # Hiragana, Katakana, CJK
    return re.search(r"[\u3040-\u30ff\u3400-\u9fff]", s) is not None


def detect_language_code(text: str) -> str:
    """Return a lightweight language code for display purposes."""
    if not text:
        return "und"
    if looks_japanese(text):
        return "ja"
    if re.search(r"[A-Za-z]", text):
        return "en"
    return "und"


def language_label(code: str) -> str:
    """Map simple language codes to human readable Japanese labels."""
    return {
        "ja": "日本語",
        "en": "英語",
        "und": "その他"
    }.get(code, "その他")

class JaTranslator:
    def __init__(self, engine="google"):
        self.engine = engine
        self._gt = None
        self._mm = None
        self.warned = False

    def _google(self, text: str) -> str:
        if self._gt is None:
            from deep_translator import GoogleTranslator
            self._gt = GoogleTranslator(source="auto", target="ja")
        return self._gt.translate(text)

    def _mymemory(self, text: str) -> str:
        # deep-translator >=1.11.0 expects region code 'ja-JP' for MyMemory
        if self._mm is None:
            from deep_translator import MyMemoryTranslator
            self._mm = MyMemoryTranslator(source="en-GB", target="ja-JP")
        return self._mm.translate(text)

    def translate(self, text: str) -> str:
        if not text or looks_japanese(text):
            return text
        try:
            if self.engine == "google":
                try:
                    return self._google(text)
                except Exception:
                    return self._mymemory(text)
            elif self.engine == "mymemory":
                try:
                    return self._mymemory(text)
                except Exception:
                    return self._google(text)
            else:
                # unknown -> google then mymemory
                try:
                    return self._google(text)
                except Exception:
                    return self._mymemory(text)
        except Exception as e:
            if not self.warned:
                print(f"[WARN] translation disabled due to error: {e.__class__.__name__}: {e}")
                self.warned = True
            return text

# ---------- X (Twitter) post injection ----------
def _read_csv_bytes(path_or_url: str) -> bytes:
    if re.match(r'^https?://', path_or_url, re.I):
        # requestsを使用してエンコーディングを適切に処理
        import requests
        response = requests.get(path_or_url, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'  # UTF-8を明示的に設定
        return response.content
    with open(path_or_url, 'rb') as f:
        return f.read()

def _extract_x_data_from_csv(raw: bytes) -> list[dict]:
    # 文字コード自動判定(UTF-8 BOM優先→UTF-8→CP932)
    for enc in ('utf-8-sig','utf-8','cp932'):
        try:
            txt = raw.decode(enc)
            break
        except Exception:
            continue
    else:
        txt = raw.decode('utf-8', errors='ignore')

    # CSV形式: "日付", "@ユーザー", "テキスト", "画像URL", "ツイートURL"
    data = []
    try:
        rdr = csv.reader(io.StringIO(txt))
        row_count = 0
        for row in rdr:
            row_count += 1
            if row_count == 1:  # ヘッダー行をスキップ
                continue
                
            if len(row) >= 3:  # 最低3列あれば処理
                date_str = row[0].strip('"').strip() if len(row) > 0 else ""
                username = row[1].strip('"').strip() if len(row) > 1 else ""
                text = row[2].strip('"').strip() if len(row) > 2 else ""
                tweet_url = row[4].strip('"').strip() if len(row) > 4 else ""
                
                # HTMLエンティティをデコード
                text = html.unescape(text)
                username = html.unescape(username)
                
                # 追加の文字化け対策
                # 全角文字の正規化
                import unicodedata
                text = unicodedata.normalize('NFKC', text)
                username = unicodedata.normalize('NFKC', username)
                
                # 不正な文字や制御文字を除去
                text = ''.join(char for char in text if char.isprintable() or char in '\n\r\t')
                
                # 連続する空白を正規化
                text = repair_mojibake(text)
                text = re.sub(r'\s+', ' ', text).strip()
                
                # URL抽出を改善（テキストからも検索）
                if not tweet_url:
                    # テキスト内からX/TwitterのURLを抽出
                    url_matches = re.findall(r'https?://(?:x\.com|twitter\.com)/[^\s,;"\']+', text)
                    if url_matches:
                        tweet_url = url_matches[0]  # 最初に見つかったURLを使用
                        print(f"[DEBUG] URL extracted from text: {tweet_url}")
                    
                    # まだURLがない場合、全ての列からURL検索
                    if not tweet_url and len(row) > 3:
                        for col_idx in range(len(row)):
                            col_content = row[col_idx].strip('"').strip()
                            col_url_matches = re.findall(r'https?://(?:x\.com|twitter\.com)/[^\s,;"\']+', col_content)
                            if col_url_matches:
                                tweet_url = col_url_matches[0]
                                print(f"[DEBUG] URL found in column {col_idx}: {tweet_url}")
                                break
                    
                    # 最後の手段：ダミーURLを生成
                    if not tweet_url:
                        if username:
                            username_clean = username.replace('@', '').replace('"', '')
                            tweet_url = f"https://x.com/{username_clean}"  # statusを削除
                        else:
                            tweet_url = "https://x.com"  # より安全なフォールバック
                
                # 有効なテキストがあれば処理（条件を大幅に緩和）
                if text and len(text.strip()) > 5:  # 5文字以上あれば処理
                    # デバッグ出力: 投稿データの詳細を表示
                    print(f"[DEBUG] Processing post: user={username}, text_len={len(text)}, text='{text[:50]}...'")
                    
                    # 日付をパース（複数フォーマットに対応）
                    dt = None
                    # 複数の日付フォーマットを試す
                    date_formats = [
                        "%B %d, %Y at %I:%M%p",  # "August 10, 2025 at 02:41AM"
                        "%B %d, %Y",             # "August 13, 2025"
                        "%Y-%m-%d %H:%M:%S",     # "2025-08-18 14:30:00"
                        "%Y-%m-%d",              # "2025-08-18"
                        "%Y年%m月%d日",           # "2025年8月18日"
                        "%m/%d/%Y",              # "8/18/2025"
                    ]
                    for fmt in date_formats:
                        try:
                            dt = datetime.strptime(date_str, fmt)
                            dt = dt.replace(tzinfo=JST)  # JSTとして扱う
                            break
                        except:
                            continue
                    
                    # パースに失敗した場合は現在時刻を使用（投稿を表示させるため）
                    if dt is None:
                        print(f"[WARN] Date parse failed for '{date_str}', using current time")
                        dt = datetime.now(JST)
                    
                    # 常に投稿を追加（デバッグ情報も含む）
                    data.append({
                        'url': tweet_url,
                        'username': username,
                        'text': text,
                        'datetime': dt,
                        'debug_info': f"Row {row_count}: {date_str} | {username} | {text[:50]}..."
                    })
                    print(f"[DEBUG] Added X post {len(data)}: {username} -> {tweet_url}")
                    print(f"[DEBUG] Text preview: {text[:100]}...")
                else:
                    print(f"[DEBUG] Skipping invalid post: user={username}, text_len={len(text) if text else 0}")
    except Exception as e:
        print(f"[WARN] CSV parsing error: {e}")
        pass

    # 古い形式のフォールバック（URL抽出のみ）
    if not data:
        urls = re.findall(r'https?://(?:x|twitter)\.com/[^\s,"]+', txt)
        for url in urls:
            data.append({
                'url': url,
                'username': '',
                'text': '',
                'datetime': NOW
            })
    
    return data

def _extract_x_urls_from_csv(raw: bytes) -> list[str]:
    # 後方互換性のため
    data = _extract_x_data_from_csv(raw)
    
    # 正規化 & 重複除去（順序維持）
    seen, out = set(), []
    for item in data:
        u = item['url'].replace('x.com/','twitter.com/')  # 正規化
        if u not in seen:
            seen.add(u); out.append(u)
    return out

def _author_from_url(u: str) -> str:
    try:
        p = urlparse(u)
        parts = p.path.strip('/').split('/')
        return '@'+parts[0] if parts and parts[0] else 'X'
    except Exception:
        return 'X'


def enhanced_gather_x_posts_implementation(csv_path: str) -> list[dict]:
    """Enhanced X Posts - 重複除去とGemini強化"""
    if ENHANCED_X_AVAILABLE:
        try:
            processor = EnhancedXProcessor()
            posts = processor.process_x_posts(csv_path, max_posts=25)
            
            if posts:
                build_items = processor.convert_to_build_format(posts)
                print(f"✅ Enhanced X処理: {len(build_items)}件 (重複除去・Gemini強化済み)")
                
                # 統計表示
                enhanced_count = sum(1 for item in build_items if item.get('_enhanced', False))
                high_priority = sum(1 for item in build_items if item.get('_priority', 0) >= 3)
                
                print(f"   🧠 Gemini強化済み: {enhanced_count}件")
                print(f"   ⭐ 高重要度投稿: {high_priority}件")
                
                return build_items
        except Exception as e:
            print(f"⚠️ Enhanced処理エラー: {e} - フォールバックを使用")
    
    # フォールバック: 元の処理
    return original_gather_x_posts(csv_path)


def gather_x_posts(csv_path: str) -> list[dict]:
    """X投稿取得 - 強制的にスコア10.0で表示"""
    print(f"🔥 X投稿取得開始（強制表示モード）: {csv_path}")
    
    # まず通常の処理を試行
    posts = enhanced_gather_x_posts_implementation(csv_path)
    # Filter by HOURS_LOOKBACK if timestamp is available, then cap to 20
    try:
        posts = [p for p in posts if not p.get('_dt') or (NOW - p['_dt'] <= timedelta(hours=HOURS_LOOKBACK))]
    except Exception:
        pass
    
    # 結果が少ない場合は、強制的に表示用のダミー投稿を追加
    if False and len(posts) < 5:
        print(f"⚡ X投稿が少ないため強制表示用投稿を追加: {len(posts)} -> 10件")
        
        dummy_posts = [
            {
                "title": "🔥 OpenAI GPT-4o - 最新AI技術",
                "link": "https://x.com/openai/status/example1",
                "_summary": "OpenAIの最新GPT-4oモデルについての技術的な詳細情報。マルチモーダル処理能力の向上と推論性能の大幅な改善が報告されています。",
                "_full_text": "OpenAIの最新GPT-4oモデルについての技術的な詳細情報。マルチモーダル処理能力の向上と推論性能の大幅な改善が報告されています。",
                "_source": "X / SNS (強制表示)",
                "_dt": datetime.now(JST),
                "_importance_score": 10.0  # 最高スコア
            },
            {
                "title": "⚡ Anthropic Claude - AI安全性研究",
                "link": "https://x.com/anthropic/status/example2",
                "_summary": "AnthropicのClaudeに関する最新の安全性研究とアライメント技術についての重要な発表。憲法的AIの新しいアプローチが紹介されています。",
                "_full_text": "AnthropicのClaudeに関する最新の安全性研究とアライメント技術についての重要な発表。憲法的AIの新しいアプローチが紹介されています。",
                "_source": "X / SNS (強制表示)",
                "_dt": datetime.now(JST),
                "_importance_score": 10.0
            },
            {
                "title": "🚀 Google DeepMind - 新研究成果",
                "link": "https://x.com/deepmind/status/example3",
                "_summary": "Google DeepMindによる最新の研究成果。強化学習とトランスフォーマーアーキテクチャの革新的な組み合わせについて。",
                "_full_text": "Google DeepMindによる最新の研究成果。強化学習とトランスフォーマーアーキテクチャの革新的な組み合わせについて。",
                "_source": "X / SNS (強制表示)",
                "_dt": datetime.now(JST),
                "_importance_score": 10.0
            },
            {
                "title": "🧠 Meta AI - LLaMA 3モデル",
                "link": "https://x.com/meta/status/example4",
                "_summary": "MetaのLLaMA 3モデルに関する最新アップデート。オープンソースAIモデルの新たな可能性と性能向上について詳しく解説。",
                "_full_text": "MetaのLLaMA 3モデルに関する最新アップデート。オープンソースAIモデルの新たな可能性と性能向上について詳しく解説。",
                "_source": "X / SNS (強制表示)",
                "_dt": datetime.now(JST),
                "_importance_score": 10.0
            },
            {
                "title": "💡 Microsoft Copilot - 開発者向け機能",
                "link": "https://x.com/microsoft/status/example5",
                "_summary": "Microsoft Copilotの開発者向け新機能について。コード生成精度の向上と新しいプログラミング言語サポートの詳細。",
                "_full_text": "Microsoft Copilotの開発者向け新機能について。コード生成精度の向上と新しいプログラミング言語サポートの詳細。",
                "_source": "X / SNS (強制表示)",
                "_dt": datetime.now(JST),
                "_importance_score": 10.0
            }
        ]
        
        # 既存の投稿と結合（重複チェック）
        existing_links = {post.get('link', '') for post in posts}
        for dummy in dummy_posts:
            if dummy['link'] not in existing_links:
                posts.append(dummy)
                if len(posts) >= 10:  # 10件まで
                    break
    
    # 全ての投稿にスコア10.0を設定（確実に表示させるため）
    for post in posts:
        post['_importance_score'] = 10.0
    
    print(f"🎯 X投稿処理完了: {len(posts)}件（全て最高スコア10.0）")
    return posts[:20]

def original_gather_x_posts(csv_path: str) -> list[dict]:
    # Check if it's a URL or local file
    is_url = csv_path.startswith('http')
    
    if not is_url and not Path(csv_path).exists():
        print(f"[INFO] X posts CSV not found at: {csv_path}")
        return []
    
    if is_url:
        print(f"[INFO] Loading X posts from Google Sheets: {csv_path}")
    else:
        print(f"[INFO] Loading X posts from local file: {csv_path}")
    items = []
    try:
        raw = _read_csv_bytes(csv_path)
        x_data = _extract_x_data_from_csv(raw)
        print(f"[INFO] Extracted {len(x_data)} X posts from CSV.")
        
        # 重複除去のためのセット
        seen_urls = set()
        seen_username_text = set()
        
        for data in x_data:
            url = data['url']
            username = data['username'] or _author_from_url(url)
            post_date = data['datetime']
            # フルテキストも保持（プレビューとは別に）
            full_text = data['text']
            text_preview = data['text'][:150] + '...' if len(data['text']) > 150 else data['text']
            
            # 重複チェック
            # 1. 同じURLの投稿は除外
            if url in seen_urls:
                print(f"[DEBUG] Skipping duplicate URL: {url}")
                continue
            
            # 2. 同じユーザーの同じテキスト内容は除外
            username_text_key = f"{username}:{full_text[:50]}"
            if username_text_key in seen_username_text:
                print(f"[DEBUG] Skipping duplicate content from {username}")
                continue
            
            # 重複チェックを通過した投稿のみ追加
            seen_urls.add(url)
            seen_username_text.add(username_text_key)
            
            # X投稿は時間フィルター無効化（すべての投稿を含める）
            # if (NOW - post_date) <= timedelta(days=7):  # 時間フィルター無効化
            if True:  # すべての投稿を処理
                items.append({
                    "title": f"Xポスト {username}",
                    "link": url,
                    "_summary": text_preview or "X投稿データ",
                    "_full_text": full_text,  # フルテキストを追加
                    "_source": "X / SNS", 
                    "_dt": post_date,  # 実際の投稿日時を使用
                })
        
        print(f"[INFO] Created {len(items)} X post items (time filter disabled).")
    except Exception as e:
        print(f"[WARN] Failed to process X posts CSV: {e}")
    return items

# ---------- HTML template ----------
PAGE_TMPL = """<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Daily AI News · {updated_title}</title>
  <link rel="stylesheet" href="style.css"/>
</head>
<body>
  <header class="site-header">
    <div class="brand-area">📰 Daily AI News</div>
    <div class="updated">最終更新: {updated_full}</div>
  </header>

  <main class="legacy-container">
    <h1>今日の最新AIニュース</h1>
    <p>直近 {lookback} 時間で収集した AI 関連トピックをカテゴリ別に掲載しています。</p>
    <div class="legacy-stats">
      <span>ビジネス {cnt_business}件</span>
      <span>ツール {cnt_tools}件</span>
      <span>SNS / 論文 {cnt_posts}件</span>
    </div>
    <div class="legacy-cards">
{sections}
    </div>
    <section class="legacy-sources">
      <h2>主要ソース上位</h2>
{source_summary}
    </section>
  </main>
</body>
</html>
"""

CARD_TMPL = """
<article class="news-card"
  role="listitem"
  data-category="{category_slug}"
  data-importance="{importance_level}"
  data-score="{score_value}"
  data-freshness="{freshness_score}"
  data-freshness-bucket="{freshness_bucket}"
  data-published-ms="{published_ms}"
  data-rank="{rank_original}"
  data-tags="{tags_filter}"
  data-source="{source_slug}">
  <header class="news-card__header">
    <span class="news-card__rank" aria-label="順位 {rank_aria}">#{rank_display}</span>
    <div class="news-card__headline">
      <a class="news-card__title" href="{link}" target="_blank" rel="noopener">{title}</a>
      <div class="news-card__meta-top">
        <span class="news-card__badge news-card__badge--{importance_level}" aria-label="重要度 {importance_label}">{importance_label}</span>
        <span class="news-card__freshness" aria-label="鮮度 {freshness_label}">{freshness_label}</span>
        <span class="news-card__score" aria-label="重要度スコア {score_aria}">スコア {score_text}</span>
      </div>
    </div>
  </header>
  <div class="news-card__body">
    <p class="news-card__summary">{summary}</p>
    <div class="news-card__taglist">
{tags_html}
    </div>
  </div>
  <footer class="news-card__footer">
    <dl class="news-card__details">
      <div>
        <dt>ソース</dt>
        <dd>{source_name}</dd>
      </div>
      <div>
        <dt>更新</dt>
        <dd>{published_text}</dd>
      </div>
      <div>
        <dt>所要時間</dt>
        <dd>{reading_time_text}</dd>
      </div>
      <div>
        <dt>翻訳</dt>
        <dd>{translation_badge}</dd>
      </div>
    </dl>
    <div class="news-card__footer-meta">
      <span class="news-card__trust" aria-label="信頼度 {source_trust}点">
        <span class="news-card__trust-bar" style="--trust-level:{source_trust_percent}%"></span>
        信頼度 {source_trust}/100
      </span>
      <a class="news-card__cta" href="{link}" target="_blank" rel="noopener">原文を開く</a>
    </div>
  </footer>
</article>
"""

EMPTY_TMPL = '<p class="news-empty">新着はありません（期間を広げるかフィードを追加してください）</p>'


def ago_str(dt: datetime) -> str:
    delta = NOW - dt
    secs = int(delta.total_seconds())
    if secs < 0:
        secs = 0
    if secs < 60: return f"{secs}秒前"
    mins = secs // 60
    if mins < 60: return f"{mins}分前"
    hrs = mins // 60
    if hrs < 24: return f"{hrs}時間前"
    days = hrs // 24
    return f"{days}日前"

    mins = secs // 60
    if mins < 60: return f"{mins}分前"
    hrs = mins // 60
    if hrs < 24: return f"{hrs}時間前"
    days = hrs // 24
    return f"{days}日前"
def clean_html(s: str) -> str:
    if not s: return ""
    # strip tags very lightly
    s = re.sub(r"<.*?>", "", s)
    s = s.replace("&nbsp;", " ").strip()
    return html.escape(s, quote=False)

def pick_summary(entry) -> str:
    for key in ("summary", "subtitle", "description"):
        if key in entry and entry[key]:
            return clean_html(entry[key])
    return clean_html(entry.get("title", ""))

def parse_feeds():
    raw = yaml.safe_load(Path("feeds.yml").read_text(encoding="utf-8"))
    return raw or {}

def get_category(conf, category_name):
    """Case-insensitive category lookup"""
    # Try exact match first
    if category_name in conf:
        return conf[category_name]
    # Try case-insensitive match
    for key, value in conf.items():
        if key.lower() == category_name.lower():
            return value
    return []

# グローバルキーワードセット（処理効率化）
INVESTMENT_KEYWORDS = frozenset([
    'funding', 'investment', 'ipo', 'venture', 'capital', 'm&a', 'acquisition',
    '投資', '資金調達', 'ipo', 'ベンチャー', '資本', '買収', '合併'
])

STRATEGY_KEYWORDS = frozenset([
    'strategy', 'executive', 'ceo', 'leadership', 'transformation', 'partnership',
    '戦略', '経営', 'ceo', 'リーダーシップ', '変革', '提携'
])

GOVERNANCE_KEYWORDS = frozenset([
    'regulation', 'policy', 'compliance', 'ethics', 'governance', 'law',
    '規制', '政策', 'コンプライアンス', '倫理', 'ガバナンス', '法律'
])

def categorize_business_news(item, feeds_info):
    """ビジネスニュースをサブカテゴリに分類（最適化版）"""
    try:
        business_category = feeds_info.get('business_category', 'general')
        title = item.get('title', '').lower() if item.get('title') else ''
        summary = item.get('_summary', '').lower() if item.get('_summary') else ''
        content = f"{title} {summary}"

        # 設定されたカテゴリを優先
        if business_category in ['strategy', 'investment', 'japan_business', 'governance']:
            return business_category

        # キーワードベースの高速分類（set lookup）
        if any(kw in content for kw in INVESTMENT_KEYWORDS):
            return 'investment'
        if any(kw in content for kw in STRATEGY_KEYWORDS):
            return 'strategy'
        if any(kw in content for kw in GOVERNANCE_KEYWORDS):
            return 'governance'

        return 'general'

    except Exception as e:
        print(f"[WARN] Error in categorize_business_news: {e}")
        return 'general'

def within_window(published_parsed):
    """時間ウィンドウチェック（改善版）"""
    try:
        if not published_parsed:
            return True, NOW  # 公開日不明の場合、保持して現在時刻を使用

        # タイムゾーン変換（エラーハンドリング強化）
        dt = datetime.fromtimestamp(time.mktime(published_parsed), tz=timezone.utc).astimezone(JST)

        # 未来の日付チェック
        if dt > NOW:
            print(f"[DEBUG] Future date detected: {dt}")
            return False, dt

        # 時間ウィンドウチェック
        time_diff = NOW - dt
        is_within = time_diff <= timedelta(hours=HOURS_LOOKBACK)

        if not is_within:
            hours_old = time_diff.total_seconds() / 3600
            print(f"[DEBUG] Item too old ({hours_old:.1f}h): {dt}")

        return is_within, dt

    except (OSError, ValueError, OverflowError) as e:
        print(f"[WARN] Time parsing error: {e}")
        return True, NOW  # エラー時は保持

def is_ai_relevant(title: str, summary: str) -> bool:
    """
    AIに関連性の高いコンテンツかどうかを判定
    より厳格なフィルタリングで質の高いニュースのみを選別
    """
    content = f"{title} {summary}".lower()
    
    # 高関連度キーワード（これらがあれば必ず含める）
    high_relevance = [
        'artificial intelligence', 'machine learning', 'deep learning', 'neural network',
        'gpt', 'llm', 'large language model', 'transformer', 'bert', 'claude',
        'chatgpt', 'gemini', 'copilot', 'anthropic', 'openai', 'deepmind',
        'computer vision', 'natural language processing', 'nlp', 'reinforcement learning',
        'generative ai', 'ai model', 'ai research', 'ai breakthrough',
        '人工知能', '機械学習', 'ディープラーニング', 'ニューラルネット',
                '人工知能', '機械学習', 'ディープラーニング', 'ニューラルネット',
        'ＡＩ', 'AI', 'ML', 'DL', '生成AI', 'ジェネレーティブAI',
        'チャットGPT', 'ChatGPT', 'GPT', 'LLM', '大規模言語モデル',
        'Claude', 'Gemini', 'Copilot', 'Bard',
        '自然言語処理', 'コンピュータビジョン', '画像認識', '音声認識',
        'ロボティクス', '自動運転', '予測分析', 'データサイエンス',
        'アルゴリズム', '最適化', 'レコメンデーション',
        'スタートアップ', '資金調達', '投資', 'ファンド', 'IPO', 'M&A',
        'ソフトバンク', 'トヨタ', 'NTT', 'ソニー', '日立', '富士通', 'NEC',
        'パナソニック', '楽天', 'リクルート', 'メルカリ', 'LINE',
    ]
    
    # 中関連度キーワード（複数あれば含める）
    medium_relevance = [
        'algorithm', 'automation', 'robot', 'autonomous', 'prediction',
        'data science', 'analytics', 'intelligent', 'smart system',
        'cognitive', 'inference', 'classification', 'recognition',
        'generation', 'synthesis', 'optimization', 'recommendation',
        'アルゴリズム', '自動化', 'ロボット', '自律', '予測',
        'データサイエンス', '分析', 'インテリジェント', 'スマート',
        '認識', '生成', '最適化', 'レコメンド'
    ]
    
    # 除外キーワード（これらがあれば除外）
    exclude_keywords = [
        'cryptocurrency', 'crypto', 'blockchain', 'bitcoin', 'nft',
        'gaming', 'game', 'sports', 'entertainment', 'music', 'movie',
        'politics', 'political', 'election', 'government policy',
        'weather', 'climate change', 'environmental',
        '暗号通貨', 'ゲーム', 'スポーツ', '娯楽', '音楽', '映画',
                '暗号通貨', 'ゲーム', 'スポーツ', '娯楽', '音楽', '映画',
        '政治', '選挙', '天気', '気候変動', '環境',
        'アニメ', 'マンガ', '芸能', 'タレント', 'アイドル',
        '恋愛', '結婚', 'グルメ', '料理', '旅行', 'ファッション'
    ]
    
    # 除外キーワードチェック
    for keyword in exclude_keywords:
        if keyword in content:
            return False
    
    # 高関連度キーワードチェック
    high_score = sum(1 for keyword in high_relevance if keyword in content)
    if high_score >= 1:
        return True
    
    # 中関連度キーワードチェック（2つ以上で採用）
    medium_score = sum(1 for keyword in medium_relevance if keyword in content)
    if medium_score >= 2:
        return True
    
    return False


def calculate_importance_score(item):
    """
    ニュースの重要度スコアを計算
    大きなニュースほど高いスコアを返す
    """
    title = item.get("title", "").lower()
    summary = item.get("_summary", "").lower()
    source = item.get("_source", "").lower()
    content = f"{title} {summary}"
    
    score = 0
    
    # 1. 企業・組織の重要度（大手企業ほど高スコア）
    major_companies = {
        'openai': 100, 'anthropic': 100, 'google': 90, 'microsoft': 90,
        'meta': 85, 'nvidia': 85, 'apple': 80, 'amazon': 80,
        'tesla': 75, 'deepmind': 95, 'cohere': 70, 'hugging face': 70,
        'mistral': 65, 'stability ai': 65, 'midjourney': 60
    }
    
    for company, points in major_companies.items():
        if company in content:
            score += points
            break  # 最高スコアのみ適用
    
    # 2. 重要キーワード（画期的な発表ほど高スコア）
    high_impact_keywords = {
        'breakthrough': 80, 'launch': 70, 'release': 65, 'announce': 60,
        'unveil': 75, 'introduce': 60, 'partnership': 55, 'acquisition': 85,
        'funding': 70, 'investment': 65, 'ipo': 90, 'valuation': 60,
        'gpt-5': 100, 'gpt-4': 80, 'claude': 70, 'gemini': 70,
        'billion': 75, 'million': 50, 'record': 65, 'first': 60
    }
    
    for keyword, points in high_impact_keywords.items():
        if keyword in content:
            score += points * 0.5  # 重複を避けるため0.5倍
    
    # 3. ソースの信頼性・影響力
    source_credibility = {
        'techcrunch': 80, 'bloomberg': 90, 'reuters': 85, 'wsj': 85,
        'financial times': 80, 'the verge': 70, 'wired': 70,
        'mit technology review': 85, 'nature': 95, 'science': 95,
        'anthropic': 90, 'openai': 90, 'google': 85, 'meta': 80
    }
    
    for src, points in source_credibility.items():
        if src in source:
            score += points * 0.3  # ソース信頼性は30%の重み
            break
    
    # 4. 技術的重要度
    tech_importance = {
        'artificial general intelligence': 100, 'agi': 100,
        'multimodal': 70, 'reasoning': 60, 'safety': 65,
        'alignment': 70, 'robotics': 60, 'autonomous': 55,
        'quantum': 70, 'neural network': 50, 'transformer': 60
    }
    
    for tech, points in tech_importance.items():
        if tech in content:
            score += points * 0.4
    
    # 5. 新鮮度ボーナス（新しいニュースにボーナス）
    dt = item.get("_dt")
    if dt:
        hours_old = (NOW - dt).total_seconds() / 3600
        if hours_old < 6:  # 6時間以内
            score += 30
        elif hours_old < 12:  # 12時間以内
            score += 20
        elif hours_old < 24:  # 24時間以内
            score += 10
    
    # 6. タイトルの長さ（詳細なタイトルほどニュース価値高い）
    title_length = len(item.get("title", ""))
    if title_length > 80:
        score += 15
    elif title_length > 50:
        score += 10
    
    return max(score, 0)  # 負のスコアは0に

def calculate_sns_importance_score(item):
    """
    SNSポストの重要度スコアを計算（8/14以降の新しい情報用）
    企業アカウント、インフルエンサー、内容の重要度で判定
    """
    title = item.get("title", "").lower()
    summary = item.get("_summary", "").lower()
    username = ""
    
    # ユーザー名を抽出
    if "xポスト" in title:
        username = title.replace("xポスト", "").strip().lower()
    
    content = f"{title} {summary}"
    score = 0
    
    # 1. 企業・組織アカウントの重要度（公式アカウントほど高スコア）
    enterprise_accounts = {
        '@openai': 100, '@anthropic': 100, '@google': 90, '@microsoft': 90,
        '@meta': 85, '@nvidia': 85, '@apple': 80, '@amazon': 80,
        '@deepmind': 95, '@huggingface': 80, '@langchainai': 75,
        '@cohereai': 70, '@stabilityai': 70, '@midjourney': 65,
        # 日本企業アカウント  
        '@softbank': 80, '@toyota': 75, '@nttcom': 70, '@sony': 70,
        '@hitachi_ltd': 65, '@fujitsu_global': 65, '@nec_corp': 65,
        '@rakuten': 60, '@recruit_jp': 55, '@mercari_jp': 50,
        # AI研究者・インフルエンサー
        '@ylecun': 90, '@karpathy': 90, '@jeffdean': 85, '@goodfellow_ian': 85,
        '@elonmusk': 75, '@satyanadella': 80, '@sundarpichai': 80,
        '@sama': 95, '@darioacemoglu': 80, '@fchollet': 85,
        '@hardmaru': 75, '@adcock_brett': 70, '@minimaxir': 65,
        # 日本のAI研究者・インフルエンサー
        '@karaage0703': 70, '@shi3z': 65, '@yukihiko_n': 60,
        '@npaka': 65, '@ohtaman': 60, '@toukubo': 55,
        # その他の著名人
        '@windsurf': 60, '@oikon48': 55, '@godofprompt': 50,
        '@newsfromgoogle': 70, '@suh_sunaneko': 50, '@pop_ikeda': 45
    }
    
    for account, points in enterprise_accounts.items():
        if account in username or account.replace('@', '') in username:
            score += points
            break  # 最高スコアのみ適用
    
    # 2. コンテンツの重要度（技術的な内容ほど高スコア）
    high_value_keywords = {
        'breakthrough': 50, 'release': 40, 'launch': 40, 'announce': 35,
        'gpt-5': 80, 'gpt-4': 60, 'claude': 50, 'gemini': 50,
        'research': 40, 'paper': 35, 'model': 30, 'ai': 20,
        'artificial intelligence': 40, 'machine learning': 35,
        'deep learning': 35, 'neural network': 30,
        # 日本語キーワード
        '人工知能': 35, '機械学習': 30, 'ディープラーニング': 30,
        '生成ai': 45, 'chatgpt': 40, '大規模言語モデル': 35,
        '研究': 30, '論文': 25, 'モデル': 20, 'ブレークスルー': 45,
        '資金調達': 40, '投資': 35, 'スタートアップ': 30
    }
    
    for keyword, points in high_value_keywords.items():
        if keyword in content:
            score += points * 0.3  # 重複を避けるため0.3倍
    
    # 3. エンゲージメント指標
    engagement_indicators = {
        'thread': 15, 'important': 20, 'must read': 25, 'breaking': 30,
        'update': 10, 'new': 15, 'latest': 10, 'just': 10,
        '重要': 20, '必見': 25, '最新': 10, '速報': 30, '更新': 10,
        '解決': 20, 'ついに': 15, '問題': 10
    }
    
    for indicator, points in engagement_indicators.items():
        if indicator in content:
            score += points * 0.2
    
    # 4. 投稿の新鮮度（8/14以降の新しさを重視）
    dt = item.get("_dt")
    if dt:
        aug14_jst = datetime(2025, 8, 14, 0, 0, 0, tzinfo=JST)
        hours_since_aug14 = (dt - aug14_jst).total_seconds() / 3600
        
        # 8/15の投稿に最高ボーナス
        if hours_since_aug14 >= 24:  # 8/15以降
            score += 30
        elif hours_since_aug14 >= 12:  # 8/14午後
            score += 20
        elif hours_since_aug14 >= 0:  # 8/14朝
            score += 10
    
    # 5. テキスト長ボーナス（詳細な投稿ほど高価値）
    text_length = len(summary)
    if text_length > 100:
        score += 10
    elif text_length > 50:
        score += 5
    
    return max(score, 0)  # 負のスコアは0に


def is_high_priority_item(item: dict) -> bool:
    """Return True when the item should be treated as a high-priority article."""
    score = normalize_importance_score(item.get("_importance_score"))
    return score >= 7.0


def calculate_source_trust(source_name):
    """ソースの信頼度を計算（0-100）"""
    trust_scores = {
        'OpenAI': 95, 'Anthropic': 95, 'Google': 90, 'Microsoft': 90,
        'Meta': 85, 'Nvidia': 85, 'Apple': 80, 'Amazon': 80,
        'DeepMind': 90, 'Hugging Face': 85, 'MIT Technology Review': 90,
        'Nature': 95, 'Science': 95, 'Reuters': 90, 'Bloomberg': 90,
        'TechCrunch': 80, 'The Verge': 75, 'VentureBeat': 80,
        'X': 60, 'SNS': 60, 'Reddit': 70, 'arXiv': 90
    }
    return trust_scores.get(source_name, 50)

def categorize_source(source_name: str) -> str:
    """ソースの種類を判別"""
    if not source_name:
        return "その他"
    lower = source_name.lower()
    official_keywords = ['openai', 'anthropic', 'google', 'microsoft', 'meta', 'nvidia', 'amazon', 'apple', 'deepmind']
    research_keywords = ['arxiv', 'nature', 'science', 'university', 'laboratory', 'lab', '研究', '論文']
    media_keywords = [
        'techcrunch', 'venturebeat', 'the verge', 'wired', 'bloomberg', 'reuters', 'forbes', 'cnbc', 'axios',
        'financial times', 'ainow', 'ledge.ai', 'generative ai media', 'businessinsider', '日経', 'itmedia',
        'publickey', 'techno-edge', 'g-gen'
    ]
    community_keywords = ['reddit', 'github', 'x / sns', 'x.com', 'twitter', 'note', 'はてな', 'zenn']

    if any(keyword in lower for keyword in official_keywords):
        return "公式リリース"
    if any(keyword in lower for keyword in research_keywords):
        return "研究・論文"
    if any(keyword in lower for keyword in media_keywords):
        return "テックメディア"
    if any(keyword in lower for keyword in community_keywords):
        return "コミュニティ・SNS"
    if 'press' in lower or 'pr times' in lower:
        return "プレスリリース"
    return "その他"

def build_source_list_html(counter: Counter, details: dict, total_items: int) -> tuple[str, str]:
    """主要ソース一覧の HTML（モダン／レガシー用）を生成"""
    if not counter:
        empty_html = "<p class=\"source-list__empty\">現在の対象期間では主要ソースが取得できませんでした。</p>"
        return empty_html, "<p>主要ソースの情報はありません。</p>"

    lines_modern = []
    lines_legacy = []
    for idx, (source, count) in enumerate(counter.most_common(12), start=1):
        detail = details.get(source, {})
        trust = int(round(detail.get("trust", 50)))
        category = detail.get("category", "その他")
        share = (count / total_items * 100) if total_items else 0
        share_text = f"{share:.1f}%"

        lines_modern.append(
            "        <li class=\"source-item\" role=\"listitem\">"
            f"<span class=\"source-item__rank\">#{idx:02d}</span>"
            f"<span class=\"source-item__name\">{html.escape(source)}</span>"
            f"<span class=\"source-item__category\">{html.escape(category)}</span>"
            f"<span class=\"source-item__count\" aria-label=\"記事数 {count}件\">{count}件</span>"
            f"<span class=\"source-item__share\" aria-label=\"全体に占める割合 {share_text}\">{share_text}</span>"
            f"<span class=\"source-item__trust\" aria-label=\"信頼度 {trust}点\">信頼度 {trust}</span>"
            "</li>"
        )

        lines_legacy.append(
            f"      <li>#{idx} {html.escape(source)}（{count}件・信頼度 {trust}・{html.escape(category)}）</li>"
        )

    modern_html = "\n".join([
        "      <ol class=\"source-list\" role=\"list\">",
        *lines_modern,
        "      </ol>"
    ])
    legacy_html = "\n".join([
        "    <ul>",
        *lines_legacy,
        "    </ul>"
    ])
    return modern_html, legacy_html

def calculate_freshness_score(dt):
    """鮮度スコアを計算（0-100）"""
    if not dt:
        return 50
    hours_old = (NOW - dt).total_seconds() / 3600
    if hours_old < 6:
        return 100  # 6時間以内
    elif hours_old < 12:
        return 90   # 12時間以内
    elif hours_old < 24:
        return 80   # 24時間以内
    elif hours_old < 48:
        return 60   # 2日以内
    elif hours_old < 168:  # 1週間
        return max(20, 60 - (hours_old - 48) / 2)
    else:
        return max(10, 20 - (hours_old - 168) / 100)

def get_freshness_indicator(score):
    """鮮度スコアに基づく表示テキスト"""
    if score >= 90: return "🔥 新着"
    elif score >= 70: return "🕐 新鮮"
    elif score >= 50: return "📄 普通"
    else: return "🗂️ 古い"

def estimate_reading_time(text):
    """推定読書時間を計算（分）"""
    if not text:
        return 1
    word_count = len(text.split())
    return max(1, round(word_count / 200))  # 200 words per minute

def normalize_importance_score(raw_score) -> float:
    """0-10程度のスケールに正規化した重要度スコアを返す。"""
    try:
        value = float(raw_score)
    except (TypeError, ValueError):
        return 0.0
    if value > 10:
        value = value / 10.0
    return max(value, 0.0)

def build_cards(items, translator, category_slug: str, category_label: str):
    """改善版カード生成関数"""
    cards = []
    for idx, it in enumerate(items[:MAX_ITEMS_PER_CATEGORY], start=1):
        title = html.unescape(it.get("title") or "(no title)")
        link = it.get("link") or "#"
        src = html.unescape(it.get("_source") or "")
        dt = it.get("_dt")
        raw_summary = html.unescape(it.get("_summary") or "")
        normalized_score = normalize_importance_score(it.get("_importance_score"))

        # ソース信頼度計算
        source_trust = int(round(calculate_source_trust(src)))
        source_trust_percent = max(0, min(100, source_trust))

        # 鮮度計算
        freshness_score = calculate_freshness_score(dt) if dt else 50
        freshness_indicator = get_freshness_indicator(freshness_score)
        if dt:
            hours_old = (NOW - dt).total_seconds() / 3600
            if hours_old <= 24:
                freshness_bucket = "24h"
            elif hours_old <= 72:
                freshness_bucket = "72h"
            elif hours_old <= 168:
                freshness_bucket = "168h"
            else:
                freshness_bucket = "all"
        else:
            freshness_bucket = "all"

        # 翻訳処理
        ja_summary = raw_summary
        did_translate = False

        if TRANSLATE_TO_JA and translator and raw_summary and not looks_japanese(raw_summary):
            cache_key = f"{link}::{hash(raw_summary)}"
            cached = TRANSLATION_CACHE.get(cache_key)
            if cached:
                ja_summary = cached
                did_translate = True
            else:
                try:
                    ja = translator.translate(raw_summary)
                    if ja and ja != raw_summary:
                        ja_summary = ja
                        TRANSLATION_CACHE[cache_key] = ja_summary
                        did_translate = True
                except Exception as e:
                    print(f"[WARN] Translation failed for {link[:50]}: {e}")

        # 要約の文字数制限
        final_summary = ja_summary if did_translate else raw_summary
        if len(final_summary) > 300:
            final_summary = final_summary[:300] + '...'

        # 読書時間推定
        min_read_time = estimate_reading_time(final_summary)
        reading_time_text = f"{min_read_time}分で読めます"

        original_lang_code = detect_language_code(raw_summary)
        translated_lang_code = detect_language_code(ja_summary if did_translate else raw_summary)
        if did_translate:
            translation_badge = f"翻訳: {language_label(translated_lang_code)} / 原文: {language_label(original_lang_code)}"
        else:
            translation_badge = f"原文: {language_label(original_lang_code)}"

        importance_level = "high" if normalized_score >= 7 else "medium" if normalized_score >= 4 else "low"
        importance_label = {"high": "重要度 高", "medium": "重要度 中", "low": "重要度 低"}[importance_level]
        score_value = f"{normalized_score:.2f}"
        score_text = f"{normalized_score:.1f}" if normalized_score > 0 else "—"
        score_aria = score_text if score_text != "—" else "スコア情報なし"

        rank_display = f"{idx:02d}"
        rank_aria = str(idx)

        # タグ生成
        source_slug = re.sub(r"[^a-z0-9]+", "", src.lower())

        tags = [category_label]
        if importance_level == "high":
            tags.append("注目")
        if freshness_bucket == "24h":
            tags.append("新着")
        elif freshness_bucket == "72h":
            tags.append("最近")
        if source_trust >= 85:
            tags.append("公式ソース")

        tags_html = "\n".join(
            f'      <span class="news-card__tag">{html.escape(tag)}</span>'
            for tag in tags
        ) or '      <span class="news-card__tag">その他</span>'
        tags_filter = ",".join(tag.lower() for tag in tags)

        if dt:
            dt_local = dt.astimezone(JST)
            published_iso = dt_local.isoformat()
            published_display_full = dt_local.strftime("%Y-%m-%d %H:%M JST")
            published_display_short = dt_local.strftime("%m/%d %H:%M")
            published_text = f'<time datetime="{html.escape(published_iso)}" title="{html.escape(published_display_full)}">{html.escape(published_display_short)}</time>'
            published_ms = int(dt.timestamp() * 1000)
        else:
            published_text = "日時不明"
            published_ms = 0

        translation_badge_safe = html.escape(translation_badge, quote=False)

        cards.append(CARD_TMPL.format(
            category_slug=html.escape(category_slug, quote=False),
            importance_level=importance_level,
            score_value=score_value,
            score_text=score_text,
            score_aria=score_aria,
            freshness_score=f"{freshness_score:.0f}",
            freshness_label=freshness_indicator,
            freshness_bucket=freshness_bucket,
            published_ms=str(published_ms),
            rank_original=str(idx),
            rank_display=rank_display,
            rank_aria=rank_aria,
            link=html.escape(link, quote=True),
            title=html.escape(title, quote=False),
            summary=html.escape(final_summary, quote=False),
            source_name=html.escape(src, quote=False),
            translation_badge=translation_badge_safe,
            reading_time_text=html.escape(reading_time_text, quote=False),
            published_text=published_text,
            importance_label=importance_label,
            tags_html=tags_html,
            tags_filter=html.escape(tags_filter, quote=True),
            source_trust=str(source_trust),
            source_trust_percent=str(source_trust_percent),
            source_slug=html.escape(source_slug, quote=True)
        ))

    return "\n".join(cards) if cards else EMPTY_TMPL

def gather_items(feeds, category_name):
    items = []
    print(f"[INFO] Processing {len(feeds)} feeds for {category_name}")
    for f in feeds:
        url = f.get("url")
        name = f.get("name", url)
        if not url: 
            print(f"[WARN] No URL for feed: {name}")
            continue
        try:
            print(f"[INFO] Fetching: {name}")
            # User-Agentを設定してアクセス拒否を回避
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            
            # 403エラー対策: リトライ機能付きでフィード取得
            retry_count = 0
            max_retries = 2
            d = None
            
            while retry_count <= max_retries:
                try:
                    # タイムアウト制限付きでフィード取得
                    import socket
                    original_timeout = socket.getdefaulttimeout()
                    socket.setdefaulttimeout(8)  # 8秒タイムアウト
                    
                    d = feedparser.parse(url, agent=headers['User-Agent'])
                    
                    socket.setdefaulttimeout(original_timeout)
                    # HTTPステータスコードチェック
                    if hasattr(d, 'status') and d.status == 403:
                        print(f"[WARN] 403 Forbidden for {name}, trying advanced fetch...")
                        # 高度なHTTPリクエストで再試行
                        d = advanced_feed_fetch(url, name)
                        if d is None:
                            print(f"[ERROR] Advanced fetch also failed for {name}")
                            break
                    break
                except Exception as retry_e:
                    retry_count += 1
                    if retry_count <= max_retries:
                        print(f"[WARN] Retry {retry_count}/{max_retries} for {name}: {retry_e}")
                        # 高度な取得を試行
                        if 'google.com' in url:
                            print(f"[INFO] Trying advanced fetch for Google service: {name}")
                            d = advanced_feed_fetch(url, name)
                            if d is not None:
                                break
                        import time
                        time.sleep(2)  # 2秒待機
                    else:
                        # 最後の手段として高度な取得を試行
                        print(f"[INFO] Final attempt with advanced fetch for {name}")
                        d = advanced_feed_fetch(url, name)
                        if d is None:
                            raise retry_e
            
            if d and d.bozo:
                print(f"[WARN] Feed parse warning for {name}: {getattr(d, 'bozo_exception', 'unknown')}")
        except Exception as e:
            print(f"[ERROR] feed parse error: {name}: {e}")
            continue
        
        # フィード取得が失敗した場合はスキップ
        if not d or not hasattr(d, 'entries'):
            print(f"[WARN] No valid feed data for {name}, skipping...")
            continue
            
        entry_count = 0
        filtered_count = 0
        for e in d.entries:
            ok, dt = within_window(e.get("published_parsed") or e.get("updated_parsed"))
            if not ok:
                continue
            
            title = e.get("title", "")
            summary = pick_summary(e)
            
            # generalフィードの場合はAI関連度をチェック
            is_general_feed = f.get("general", False)
            if is_general_feed:
                if not is_ai_relevant(title, summary):
                    filtered_count += 1
                    continue
            
            # 403エラーURLをチェック
            link_url = e.get("link", "")
            if is_403_url(link_url):
                print(f"🚫 403 URL除外: {title[:50]}...")
                continue
                
            entry_count += 1
            # 重要度スコア計算
            importance_score = 50  # デフォルト値
            if category_name == "Business":
                importance_score = calculate_importance_score({
                    "title": title,
                    "_summary": summary,
                    "_source": name,
                    "_dt": dt
                })
            elif category_name == "Posts":
                importance_score = calculate_sns_importance_score({
                    "title": title,
                    "_summary": summary,
                    "_dt": dt
                })

            items.append({
                "title": title,
                "link": link_url,
                "_summary": summary,
                "_source": name,
                "_dt": dt,
                "_importance_score": importance_score
            })
        if entry_count > 0:
            if filtered_count > 0:
                print(f"[INFO] Found {entry_count} recent items from {name} (filtered out {filtered_count} non-AI items)")
            else:
                print(f"[INFO] Found {entry_count} recent items from {name}")
    # スマートソート: 重要度と時刻を組み合わせて並び替え
    if category_name == "Business":
        # ビジネスニュースは重要度順でソート
        items.sort(key=lambda x: (calculate_importance_score(x), x["_dt"]), reverse=True)
        print(f"[INFO] {category_name}: Sorted by importance score")
    elif category_name == "Posts":
        # SNS/論文ポストは重要度順でソート
        items.sort(key=lambda x: (calculate_sns_importance_score(x), x["_dt"]), reverse=True)
        print(f"[INFO] {category_name}: Sorted by SNS importance score")
    else:
        # ツールカテゴリは時刻順
        items.sort(key=lambda x: x["_dt"], reverse=True)
    
    # 最終チェック: 403 URLがないことを確認
    items_before_filter = len(items)
    items = filter_403_urls(items)
    items_after_filter = len(items)
    
    if items_before_filter != items_after_filter:
        print(f"✅ {category_name}: 最終フィルターで{items_before_filter - items_after_filter}件の403 URLを除外")
    
    print(f"[INFO] {category_name}: Total {len(items)} items found")
    return items

def main():
    """メイン処理（改善版）"""
    start_time = time.time()

    print(f"\n{'='*60}")
    print(f"🚀 Daily AI News Build Started")
    print(f"📅 {NOW.strftime('%Y-%m-%d %H:%M:%S JST')}")
    print(f"⚙️  Config: LOOKBACK={HOURS_LOOKBACK}h, MAX_ITEMS={MAX_ITEMS_PER_CATEGORY}")
    print(f"🔤 Translate: {TRANSLATE_TO_JA} (engine: {TRANSLATE_ENGINE})")
    print(f"{'='*60}\n")
    
    global TRANSLATION_CACHE
    TRANSLATION_CACHE = load_cache()
    print(f"[INFO] Loaded {len(TRANSLATION_CACHE)} cached translations")

    # デバッグモードの場合、追加情報を表示
    if CONFIG['debug_mode']:
        print(f"[DEBUG] Feed sources: {len(parse_feeds())} categories")
        print(f"[DEBUG] Translation engine: {CONFIG['translate_engine']}")
        print(f"[DEBUG] Gemini API: {'enabled' if CONFIG['gemini_api_key'] else 'disabled'}")

    try:
        feeds_conf = parse_feeds()
        print(f"[INFO] Loaded {sum(len(v) for v in feeds_conf.values())} feeds from feeds.yml")
    except Exception as e:
        print(f"[ERROR] Failed to parse feeds.yml: {e}")
        feeds_conf = {}
    
    # Gather items with error handling
    try:
        business = gather_items(get_category(feeds_conf, "Business"), "Business")
        print(f"[INFO] Gathered {len(business)} Business items")
    except Exception as e:
        print(f"[ERROR] Failed to gather Business items: {e}")
        business = []
    
    try:
        tools = gather_items(get_category(feeds_conf, "Tools"), "Tools")
        print(f"[INFO] Gathered {len(tools)} Tools items")
    except Exception as e:
        print(f"[ERROR] Failed to gather Tools items: {e}")
        tools = []
    
    try:
        posts = gather_items(get_category(feeds_conf, "Posts"), "Posts")
        print(f"[INFO] Gathered {len(posts)} Posts items")
    except Exception as e:
        print(f"[ERROR] Failed to gather Posts items: {e}")
        posts = []
    
    # Remove global duplicates across all categories first
    print(f"[INFO] Removing duplicates across all categories...")
    all_items = business + tools + posts
    print(f"[INFO] Before deduplication: {len(all_items)} total items")
    
    seen_links = set()
    seen_titles = set()
    unique_business = []
    unique_tools = []
    unique_posts = []
    
    # Process each category and remove duplicates
    for item in business:
        link = item.get('link', '')
        title = item.get('title', '').lower().strip()
        if link not in seen_links and title not in seen_titles:
            unique_business.append(item)
            seen_links.add(link)
            seen_titles.add(title)
    
    for item in tools:
        link = item.get('link', '')
        title = item.get('title', '').lower().strip()
        if link not in seen_links and title not in seen_titles:
            unique_tools.append(item)
            seen_links.add(link)
            seen_titles.add(title)
    
    for item in posts:
        link = item.get('link', '')
        title = item.get('title', '').lower().strip()
        if link not in seen_links and title not in seen_titles:
            unique_posts.append(item)
            seen_links.add(link)
            seen_titles.add(title)
    
    # Update with deduplicated items
    business = unique_business
    tools = unique_tools  
    posts = unique_posts
    
    print(f"[INFO] After deduplication: Business={len(business)}, Tools={len(tools)}, Posts={len(posts)}")
    
    # Inject X posts
    if X_POSTS_CSV:
        try:
            x_posts = gather_x_posts(X_POSTS_CSV)
            if x_posts:
                print(f"[INFO] Adding {len(x_posts)} X posts")
                # Only add X posts that aren't already in posts
                for x_post in x_posts:
                    x_link = x_post.get('link', '')
                    x_title = x_post.get('title', '').lower().strip()
                    if x_link not in seen_links and x_title not in seen_titles:
                        posts.append(x_post)
                        seen_links.add(x_link)
                        seen_titles.add(x_title)
            else:
                print(f"[INFO] No X posts to add")
            posts = sorted(posts, key=lambda x: x.get('_dt', NOW), reverse=True)
        except Exception as e:
            print(f"[WARN] Failed to process X posts: {e}")


    try:
        translator = JaTranslator(engine=TRANSLATE_ENGINE)
    except Exception as e:
        print(f"[WARN] Failed to initialize translator: {e}")
        translator = None

    selected_business = business[:MAX_ITEMS_PER_CATEGORY]
    selected_tools = tools[:MAX_ITEMS_PER_CATEGORY]
    selected_posts = posts[:MAX_ITEMS_PER_CATEGORY]

    sections_html = []
    try:
        sections_html.append(build_cards(selected_business, translator, "business", "ビジネス"))
    except Exception as e:
        print(f"[ERROR] Failed to build Business section: {e}")
        sections_html.append(EMPTY_TMPL)
    
    try:
        sections_html.append(build_cards(selected_tools, translator, "tools", "ツール"))
    except Exception as e:
        print(f"[ERROR] Failed to build Tools section: {e}")
        sections_html.append(EMPTY_TMPL)
    
    try:
        sections_html.append(build_cards(selected_posts, translator, "posts", "SNS/論文"))
    except Exception as e:
        print(f"[ERROR] Failed to build Posts section: {e}")
        sections_html.append(EMPTY_TMPL)

    # 統計情報表示（改善版）
    final_business = len(selected_business)
    final_tools = len(selected_tools)
    final_posts = len(selected_posts)
    total_final = final_business + final_tools + final_posts
    total_original = len(business) + len(tools) + len(posts)

    print(f"\n{'='*60}")
    print(f"📊 Processing Summary")
    print(f"{'='*60}")
    print(f"📈 Original counts:")
    print(f"   Business: {len(business):3d} → {final_business:3d} items")
    print(f"   Tools:    {len(tools):3d} → {final_tools:3d} items")
    print(f"   Posts:    {len(posts):3d} → {final_posts:3d} items")
    print(f"   Total:    {total_original:3d} → {total_final:3d} items")
    print(f"   Filtered: {total_original - total_final:3d} items")

    # 処理時間計算
    end_time = time.time()
    processing_time = end_time - start_time
    print(f"\n⏱️  Processing Time: {processing_time:.2f} seconds")

    if total_final > 0:
        avg_time_per_item = processing_time / total_final
        print(f"   Average per item: {avg_time_per_item:.3f} seconds")
    print(f"{'='*60}\n")

    displayed_items = selected_business + selected_tools + selected_posts
    source_counter = Counter()
    source_details = {}
    for item in displayed_items:
        src = (item.get("_source") or "").strip()
        if not src:
            continue
        source_counter[src] += 1
        if src not in source_details:
            source_details[src] = {
                "trust": calculate_source_trust(src),
                "category": categorize_source(src)
            }
    unique_sources = set(source_counter.keys())
    high_priority_count = sum(1 for item in displayed_items if is_high_priority_item(item))
    lookback_label = f"{HOURS_LOOKBACK}h"
    page_title = f"Daily AI News — {NOW.strftime('%Y-%m-%d %H:%M JST')}"
    generated_at = NOW.strftime("%Y-%m-%d %H:%M:%S JST")
    legacy_sections_for_modern = textwrap.indent("\n".join(sections_html).strip(), "      ")
    source_sample = "、".join(sorted(unique_sources)[:10])
    if not source_sample:
        source_sample = "現在の対象期間ではソース情報が取得できません"
    source_list_html, legacy_source_html = build_source_list_html(
        source_counter, source_details, max(total_final, 1)
    )

    html_out = PAGE_TMPL.format(
        updated_title=NOW.strftime("%Y-%m-%d %H:%M JST"),
        updated_full=NOW.strftime("%Y-%m-%d %H:%M JST"),
        lookback=HOURS_LOOKBACK,
        cnt_business=final_business,
        cnt_tools=final_tools,
        cnt_posts=final_posts,
        sections="".join(sections_html),
        source_summary=legacy_source_html
    )
    # Remove stray backslashes that broke markup
    html_out = html_out.replace("\\", "")

    try:
        Path("news_detail.html").write_text(html_out, encoding="utf-8")
        print(f"[SUCCESS] Wrote news_detail.html ({len(html_out)} bytes)")
    except Exception as e:
        print(f"[ERROR] Failed to write news_detail.html: {e}")
        raise

    # Use Bootstrap 5 template for reliable tab functionality
    modern_template_path = Path("templates/bootstrap_template.html")
    modern_replacements = {
        "%%PAGE_TITLE%%": page_title,
        "%%GENERATED_AT%%": generated_at,
        "%%UPDATED_FULL%%": NOW.strftime("%Y-%m-%d %H:%M JST"),
        "%%LOOKBACK_HOURS%%": str(HOURS_LOOKBACK),
        "%%LOOKBACK_LABEL%%": lookback_label,
        "%%TOTAL_ITEMS%%": str(len(displayed_items)),
        "%%HIGH_PRIORITY_ITEMS%%": str(high_priority_count),
        "%%SOURCE_COUNT%%": str(len(unique_sources)),
        "%%BUSINESS_COUNT%%": str(final_business),
        "%%TOOLS_COUNT%%": str(final_tools),
        "%%POSTS_COUNT%%": str(final_posts),
        "%%RESULT_COUNT%%": str(total_final),
        "%%SOURCE_SAMPLE%%": source_sample,
        "%%SOURCE_LIST%%": source_list_html,
        "%%LEGACY_SECTIONS%%": legacy_sections_for_modern + ("\n" if legacy_sections_for_modern else "    <!-- 記事データなし -->\n"),
    }

    if modern_template_path.exists():
        try:
            modern_html = modern_template_path.read_text(encoding="utf-8")
            for token, value in modern_replacements.items():
                modern_html = modern_html.replace(token, value)
            Path("index.html").write_text(modern_html, encoding="utf-8")
            print(f"[SUCCESS] Wrote index.html ({len(modern_html)} bytes) using modern template")
        except Exception as e:
            print(f"[WARN] Failed to build modern index: {e}")
            try:
                Path("index.html").write_text(html_out, encoding="utf-8")
                print("[INFO] Fallback: wrote legacy markup to index.html")
            except Exception as fallback_error:
                print(f"[ERROR] Failed to write fallback index.html: {fallback_error}")
    else:
        try:
            Path("index.html").write_text(html_out, encoding="utf-8")
            print("[WARN] Modern template not found; wrote legacy markup to index.html")
        except Exception as fallback_error:
            print(f"[ERROR] Failed to write fallback index.html: {fallback_error}")

    try:
        save_cache(TRANSLATION_CACHE)
        print(f"[SUCCESS] Saved {len(TRANSLATION_CACHE)} translations to cache")
    except Exception as e:
        print(f"[WARN] Failed to save cache: {e}")

if __name__ == "__main__":
    main()
