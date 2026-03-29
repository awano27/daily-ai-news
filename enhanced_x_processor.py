#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced X Posts Processor - 重複除去と詳細要約の改善
"""
import os
import re
import csv
import io
import hashlib
from datetime import datetime, timezone, timedelta
from pathlib import Path

JST = timezone(timedelta(hours=9))
from urllib.parse import urlparse
import requests

# Gemini URL contextが利用可能かチェック
try:
    from gemini_url_context import GeminiURLContextClient
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

def load_env():
    """環境変数を.envファイルから読み込み"""
    env_path = Path('.env')
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

class EnhancedXProcessor:
    def __init__(self):
        load_env()
        self.gemini_client = None
        if GEMINI_AVAILABLE and os.getenv("GEMINI_API_KEY"):
            try:
                self.gemini_client = GeminiURLContextClient()
                print("✅ Gemini URL context client initialized for X post enhancement")
            except Exception as e:
                print(f"⚠️ Gemini client initialization failed: {e}")
                self.gemini_client = None
        
    def create_content_hash(self, text: str) -> str:
        """投稿内容のハッシュを作成（重複検出用）"""
        # テキストを正規化
        normalized = re.sub(r'\s+', ' ', text.lower().strip())
        # URLやメンションを除去してコア内容を抽出
        normalized = re.sub(r'https?://\S+', '', normalized)
        normalized = re.sub(r'@\w+', '', normalized)
        normalized = re.sub(r'#\w+', '', normalized)
        
        return hashlib.md5(normalized.encode('utf-8')).hexdigest()[:12]
    
    def is_similar_content(self, text1: str, text2: str, threshold: float = 0.7) -> bool:
        """2つの投稿内容が類似しているかチェック"""
        def extract_keywords(text):
            # 日本語と英語のキーワードを抽出
            words = set()
            # 英語の単語
            english_words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
            words.update(english_words)
            # 日本語の単語（簡易版）
            japanese_words = re.findall(r'[ぁ-ゟ一-龯]{2,}', text)
            words.update(japanese_words)
            return words
        
        keywords1 = extract_keywords(text1)
        keywords2 = extract_keywords(text2)
        
        if not keywords1 or not keywords2:
            return False
        
        intersection = len(keywords1 & keywords2)
        union = len(keywords1 | keywords2)
        
        similarity = intersection / union if union > 0 else 0
        return similarity > threshold
    
    def enhance_post_with_gemini(self, post_data: dict) -> dict:
        """Gemini URL contextを使って投稿を強化"""
        if not self.gemini_client:
            return post_data
        
        try:
            # 投稿URLがある場合は、そのコンテキストを分析
            post_url = post_data.get('url', '')
            original_text = post_data.get('text', '')
            
            if post_url and original_text:
                prompt = f"""
                以下のX投稿の内容を分析し、300文字以内の簡潔な要約を日本語で作成してください：

                投稿内容: {original_text}

                以下の形式で回答してください：
                ## 要約
                投稿の核心的な内容を200文字以内で簡潔に要約（改行なし）

                ## カテゴリ
                [AI技術/ビジネス/開発ツール/その他]のいずれか

                ## 重要度
                [高/中/低]

                要約は必ず300文字以内で、簡潔で読みやすくしてください。
                """
                
                result = self.gemini_client.generate_from_urls(
                    prompt=prompt,
                    urls=[post_url] if post_url.startswith('http') else [],
                    enable_search=False
                )
                
                if result.get('text') and 'error' not in result:
                    # Gemini分析結果をパース
                    analysis = result['text']
                    
                    # 要約部分を抽出
                    summary_match = re.search(r'## 要約\s*\n(.+?)(?=\n##|\n$|$)', analysis, re.DOTALL)
                    if summary_match:
                        enhanced_summary = summary_match.group(1).strip()
                        # 300文字制限を適用
                        if len(enhanced_summary) > 300:
                            enhanced_summary = enhanced_summary[:300] + '...'
                        # 改行を削除して一行にまとめる
                        enhanced_summary = re.sub(r'\s+', ' ', enhanced_summary).strip()
                        post_data['_enhanced_summary'] = enhanced_summary
                        post_data['_gemini_enhanced'] = True
                    
                    # カテゴリを抽出
                    category_match = re.search(r'## カテゴリ\s*\n(.+?)(?=\n##|\n$|$)', analysis, re.DOTALL)
                    if category_match:
                        category = category_match.group(1).strip()
                        post_data['_category'] = category
                    
                    # 重要度を抽出
                    importance_match = re.search(r'## 重要度\s*\n(.+?)(?=\n##|\n$|$)', analysis, re.DOTALL)
                    if importance_match:
                        importance = importance_match.group(1).strip()
                        post_data['_importance'] = importance
                
        except Exception as e:
            print(f"⚠️ Gemini enhancement failed for post: {e}")
        
        return post_data
    
    def process_x_posts(self, csv_url: str, max_posts: int = 50) -> list:
        """X投稿を処理して重複除去と要約強化を実行"""
        print(f"🔄 Processing X posts from: {csv_url}")
        
        try:
            # CSV データを取得（エンコーディングを明示的に指定）
            response = requests.get(csv_url, timeout=30)
            response.raise_for_status()
            
            # エンコーディングを明示的にUTF-8に設定
            response.encoding = 'utf-8'
            
            # CSV をパース  
            content = response.text
            
            # まず通常のCSVリーダーでデータを確認
            lines = content.strip().split('\n')
            print(f"[DEBUG] First 3 CSV lines:")
            for i, line in enumerate(lines[:3], 1):
                print(f"   {i}: {line}")
            
            # ヘッダーなしのCSVとして処理
            reader = csv.reader(io.StringIO(content))
            
            # CSV列名を手動設定
            expected_columns = ['Date', 'Username', 'Tweet Text', 'Media URL', 'Tweet URL']
            print(f"[DEBUG] Expected columns: {expected_columns}")
            
            posts = []
            seen_hashes = set()
            seen_texts = []
            processed_count = 0
            total_rows = 0
            
            for row in reader:
                total_rows += 1
                if processed_count >= max_posts:
                    break
                
                # 行に十分な列があることを確認
                if len(row) < 5:
                    print(f"[DEBUG] Skipping row {total_rows}: insufficient columns ({len(row)})")
                    continue
                
                # インデックスベースでデータを抽出
                date_str = row[0].strip('"').strip() if len(row) > 0 else ''
                username = row[1].strip('"').strip() if len(row) > 1 else ''
                text = row[2].strip('"').strip() if len(row) > 2 else ''
                media_url = row[3].strip('"').strip() if len(row) > 3 else ''
                post_url = row[4].strip('"').strip() if len(row) > 4 else ''
                
                # HTMLエンティティをデコード
                import html
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
                import re
                text = re.sub(r'\s+', ' ', text).strip()
                
                print(f"[DEBUG] Row {total_rows}: date={date_str[:20]}..., user={username}, text_len={len(text)}")
                
                if not text or not username or len(text.strip()) < 5:
                    print(f"[DEBUG] Skipping row {total_rows}: invalid data")
                    continue
                
                # 重複チェック1: ハッシュベース
                content_hash = self.create_content_hash(text)
                if content_hash in seen_hashes:
                    print(f"[DEBUG] Skipping duplicate hash: {username}")
                    continue
                
                # 重複チェック2: 類似コンテンツ
                is_similar = any(self.is_similar_content(text, seen_text) for seen_text in seen_texts)
                if is_similar:
                    print(f"[DEBUG] Skipping similar content: {username}")
                    continue
                
                # 日付パース（失敗した投稿はスキップ）
                dt = None
                date_formats = [
                    "%B %d, %Y at %I:%M%p",
                    "%B %d, %Y",
                    "%Y-%m-%d %H:%M:%S",
                    "%Y-%m-%d",
                    "%Y年%m月%d日",
                    "%m/%d/%Y",
                ]
                for fmt in date_formats:
                    try:
                        dt = datetime.strptime(date_str, fmt).replace(tzinfo=JST)
                        break
                    except (ValueError, TypeError):
                        continue
                if dt is None:
                    print(f"[WARN] Date parse failed for '{date_str}', skipping post (user={username})")
                    continue

                # 基本的な投稿データを作成
                post_data = {
                    'username': username.replace('@', ''),
                    'text': text,
                    'url': post_url,
                    'date': date_str,
                    '_parsed_dt': dt,
                    '_content_hash': content_hash,
                    '_gemini_enhanced': False
                }
                
                # Geminiで強化
                post_data = self.enhance_post_with_gemini(post_data)
                
                # 重複チェックセットに追加
                seen_hashes.add(content_hash)
                seen_texts.append(text)
                
                posts.append(post_data)
                processed_count += 1
                
                print(f"[INFO] Processed post {processed_count}: {username}")
            
            print(f"📊 Processing summary:")
            print(f"   Total CSV rows: {total_rows}")
            print(f"   Valid posts processed: {processed_count}")
            print(f"   Final unique posts: {len(posts)}")
            print(f"✅ Processed {len(posts)} unique X posts")
            return posts
            
        except Exception as e:
            print(f"❌ Failed to process X posts: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def convert_to_build_format(self, posts: list) -> list:
        """build.pyの形式に変換"""
        items = []
        
        for post in posts:
            username = post['username']
            text = post['text']
            url = post['url']
            
            # 強化された要約があれば使用、なければ従来の方法
            if post.get('_enhanced_summary'):
                summary = post['_enhanced_summary']
                title = f"🧠 {username} - {post.get('_category', 'AI関連')}"
            else:
                # フォールバック: 従来の方法（300文字制限）
                if len(text) > 300:
                    summary = text[:300] + '...'
                else:
                    summary = text
                title = f"Xポスト {username}"
            
            # 重要度に基づくプライオリティ
            priority = 0
            if post.get('_importance') == '高':
                priority = 3
            elif post.get('_importance') == '中':
                priority = 2
            else:
                priority = 1
            
            # 最終的な要約の文字数制限チェック
            if len(summary) > 300:
                summary = summary[:300] + '...'
            
            item = {
                "title": title,
                "link": url,
                "_summary": summary,
                "_full_text": text,
                "_source": "X / SNS (Enhanced)",
                "_dt": post.get('_parsed_dt') or datetime.now(timezone.utc),
                "_enhanced": post.get('_gemini_enhanced', False),
                "_priority": priority,
                "_category": post.get('_category', ''),
                "_content_hash": post.get('_content_hash', '')
            }
            
            items.append(item)
        
        # 重要度でソート（高重要度が先頭）
        items.sort(key=lambda x: x['_priority'], reverse=True)
        
        return items

def main():
    """テスト実行"""
    processor = EnhancedXProcessor()
    
    # Google Sheets URL
    csv_url = "https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0"
    
    # X投稿を処理
    posts = processor.process_x_posts(csv_url, max_posts=10)
    
    if posts:
        print(f"\n📊 処理結果: {len(posts)}件の投稿")
        
        # build.py形式に変換
        build_items = processor.convert_to_build_format(posts)
        
        print("\n📝 変換された投稿例:")
        for i, item in enumerate(build_items[:3], 1):
            print(f"\n{i}. {item['title']}")
            print(f"   要約: {item['_summary'][:100]}...")
            print(f"   強化済み: {'✅' if item['_enhanced'] else '❌'}")
            print(f"   重要度: {item['_priority']}")
    else:
        print("❌ 投稿の処理に失敗しました")

if __name__ == "__main__":
    main()