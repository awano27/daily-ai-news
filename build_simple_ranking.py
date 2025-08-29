# -*- coding: utf-8 -*-
"""
Simple Enhanced Daily AI News - 遒ｺ螳溘↓蜍穂ｽ懊☆繧九Λ繝ｳ繧ｭ繝ｳ繧ｰ繧ｷ繧ｹ繝・Β
蜈・・ build.py 繧偵・繝ｼ繧ｹ縺ｫ縲∵ュ蝣ｱ驥上ｒ邯ｭ謖√＠縺､縺､繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ讖溯・繧定ｿｽ蜉

HTML Structure Fix Applied: 2025-08-23
- Enhanced card template with priority system
- Proper HTML tag structure and closure
- CSS generation included for styling
- Tab functionality JavaScript fixed (hidden class logic)
- Force GitHub Actions to use this updated version
"""

import os, re, sys, json, time, html, csv, io
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen
import yaml
import feedparser
import requests
import random
from bs4 import BeautifulSoup

# 蝓ｺ譛ｬ險ｭ螳・HOURS_LOOKBACK = int(os.getenv('HOURS_LOOKBACK', '24'))
MAX_ITEMS_PER_CATEGORY = int(os.getenv('MAX_ITEMS_PER_CATEGORY', '25'))
TOP_PICKS_COUNT = int(os.getenv('TOP_PICKS_COUNT', '10'))
TRANSLATE_TO_JA = os.getenv('TRANSLATE_TO_JA', '1') == '1'
TRANSLATE_ENGINE = os.getenv('TRANSLATE_ENGINE', 'google')
X_POSTS_CSV = os.getenv('X_POSTS_CSV', 'https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0')

# 鄙ｻ險ｳ讖溯・
try:
    from deep_translator import GoogleTranslator, MyMemoryTranslator
    TRANSLATE_AVAILABLE = True
    print("笨・鄙ｻ險ｳ讖溯・: 蛻ｩ逕ｨ蜿ｯ閭ｽ")
except ImportError:
    print("笞・・鄙ｻ險ｳ讖溯・: deep-translator譛ｪ繧､繝ｳ繧ｹ繝医・繝ｫ")
    TRANSLATE_AVAILABLE = False

class SimpleEngineerRanking:
    """AI繧ｨ繝ｳ繧ｸ繝九い/讌ｭ蜍吝柑邇・喧 譛臥畑蠎ｦ繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ"""
    
    # エンジニア重要キーワード（重み付き）
    TECH_KEYWORDS = {
        'code': 3.0, 'api': 3.0, 'sdk': 3.0, 'github': 3.0, 'implementation': 3.0,
        'tutorial': 3.0, 'framework': 3.0, 'library': 3.0, 'sample': 2.8,
        'pytorch': 2.5, 'tensorflow': 2.5, 'huggingface': 2.5, 'gpt': 2.5,
        'llm': 2.5, 'openai': 2.5, 'anthropic': 2.5, 'model': 2.5, 'ai': 2.5,
        'docker': 2.0, 'kubernetes': 2.0, 'aws': 2.0, 'azure': 2.0, 'gcp': 2.0,
        'deployment': 2.0, 'production': 2.0, 'mlops': 2.0,
        'performance': 1.8, 'benchmark': 1.8, 'optimization': 1.8, 'speed': 1.8,
        'memory': 1.8, 'gpu': 1.8, 'cuda': 1.8,
        'research': 1.5, 'paper': 1.5, 'arxiv': 1.5, 'algorithm': 1.5,
        'method': 1.5, 'evaluation': 1.5
    }

    # 業務効率・実務活用のキーワード（重み付き）
    EFFICIENCY_KEYWORDS = {
        'automation': 3.0, 'automate': 3.0, 'workflow': 3.0, 'rpa': 3.0,
        'copilot': 3.0, 'prompt': 2.6, 'prompt engineering': 2.8,
        'zapier': 2.8, 'make.com': 2.4, 'notion': 2.2, 'slack': 2.0,
        'excel': 2.4, 'spreadsheet': 2.2, 'power automate': 2.6,
        'powerapps': 2.2, 'power bi': 2.2, 'apps script': 2.4, 'gas': 2.4
    }
    
    # 菫｡鬆ｼ縺ｧ縺阪ｋ繧ｽ繝ｼ繧ｹ
    TRUSTED_DOMAINS = [
        'arxiv.org', 'github.com', 'pytorch.org', 'tensorflow.org', 
        'huggingface.co', 'openai.com', 'anthropic.com', 'deepmind.com',
        'ai.googleblog.com', 'research.facebook.com', 'cloud.google.com',
        'learn.microsoft.com', 'devblogs.microsoft.com', 'powerautomate.microsoft.com',
        'zapier.com', 'notion.so', 'workspaceupdates.googleblog.com',
        'salesforce.com', 'atlassian.com', 'ibm.com'
    ]
    
    @classmethod
    def calculate_score(cls, item):
        """AI繧ｨ繝ｳ繧ｸ繝九い/讌ｭ蜍吝柑邇・喧縺ｮ譛臥畑蠎ｦ繧ｹ繧ｳ繧｢ (0-10)"""
        title = item.get('title', '').lower()
        summary = item.get('summary', '').lower()
        url = item.get('url', '').lower()
        
        content = f"{title} {summary}"
        score = 0.0
        
        # 繧ｭ繝ｼ繝ｯ繝ｼ繝峨・繝・メ繝ｳ繧ｰ
        for keyword, weight in cls.TECH_KEYWORDS.items():
            if keyword in content:
                score += weight
                if keyword in title:
                    score += weight * 0.5
        for keyword, weight in cls.EFFICIENCY_KEYWORDS.items():
            if keyword in content:
                score += weight
                if keyword in title:
                    score += weight * 0.6
        
        # 菫｡鬆ｼ縺ｧ縺阪ｋ繧ｽ繝ｼ繧ｹ繝懊・繝翫せ
        domain = urlparse(url).netloc.lower()
        for trusted in cls.TRUSTED_DOMAINS:
            if trusted in domain:
                score *= 1.25
                break
        
        # 螳溯｣・繝上え繝・・/繧ｳ繝ｼ繝峨・迚ｹ蛻･繝懊・繝翫せ
        howto_indicators = [
            'how to', 'step-by-step', 'guide', 'tutorial', 'best practices',
            'チュートリアル', '手順', '入門', '使い方', '導入事例', '活用事例'
        ]
        code_indicators = ['```', 'code example', 'implementation', 'github.com', 'gist.github.com']
        if any(x in content for x in howto_indicators + code_indicators):
            score *= 1.15
        
        # 10轤ｹ貅轤ｹ縺ｫ豁｣隕丞喧
        return min(score, 10.0)

def load_translation_cache():
    """鄙ｻ險ｳ繧ｭ繝｣繝・す繝･繧定ｪｭ縺ｿ霎ｼ縺ｿ"""
    cache_file = Path('_cache/translations.json')
    if cache_file.exists():
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    return {}

def save_translation_cache(cache):
    """鄙ｻ險ｳ繧ｭ繝｣繝・す繝･繧剃ｿ晏ｭ・"""
    cache_dir = Path('_cache')
    cache_dir.mkdir(exist_ok=True)
    cache_file = cache_dir / 'translations.json'
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def translate_text(text, target_lang='ja', cache=None):
    """繝・く繧ｹ繝医ｒ鄙ｻ險ｳ・医く繝｣繝・す繝･蟇ｾ蠢懶ｼ・"""
    if not TRANSLATE_AVAILABLE or not TRANSLATE_TO_JA:
        return text
    
    if cache is None:
        cache = {}
    
    # 繧ｭ繝｣繝・す繝･繝√ぉ繝・け
    cache_key = f"{text[:100]}_{target_lang}"
    if cache_key in cache:
        return cache[cache_key]
    
    try:
        if TRANSLATE_ENGINE == 'google':
            translator = GoogleTranslator(source='auto', target=target_lang)
        else:
            translator = MyMemoryTranslator(source='auto', target=target_lang)
        
        result = translator.translate(text[:500])  # 髟ｷ縺・ユ繧ｭ繧ｹ繝医・蛻・ｊ隧ｰ繧・        cache[cache_key] = result
        return result
    except:
        return text

def load_feeds_config():
    """繝輔ぅ繝ｼ繝芽ｨｭ螳壹ｒ隱ｭ縺ｿ霎ｼ縺ｿ"""
    feeds_file = Path('feeds.yml')
    if feeds_file.exists():
        with open(feeds_file, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    
    # 繝・ヵ繧ｩ繝ｫ繝郁ｨｭ螳・
    return {
        'business': [
            {'url': 'https://techcrunch.com/feed/', 'name': 'TechCrunch'},
            {'url': 'https://aws.amazon.com/blogs/machine-learning/feed/', 'name': 'AWS ML Blog'},
            {'url': 'https://ai.googleblog.com/feeds/posts/default', 'name': 'Google AI Blog'}
        ],
        'tools': [
            {'url': 'https://huggingface.co/blog/feed.xml', 'name': 'Hugging Face'},
            {'url': 'https://pytorch.org/blog/feed.xml', 'name': 'PyTorch Blog'},
            {'url': 'https://blog.openai.com/rss/', 'name': 'OpenAI Blog'}
        ],
        'posts': [
            {'url': 'https://www.reddit.com/r/MachineLearning/.rss', 'name': 'Reddit ML'},
            {'url': 'https://arxiv.org/rss/cs.AI', 'name': 'ArXiv AI'},
            {'url': 'https://arxiv.org/rss/cs.LG', 'name': 'ArXiv Learning'}
        ]
    }

def is_recent(published_date, hours_back=24):
    """謖・ｮ壽凾髢灘・縺ｮ險倅ｺ九°繝√ぉ繝・け"""
    if not published_date:
        return True
    
    try:
        if isinstance(published_date, str):
            # ISO蠖｢蠑上ｄ荳闊ｬ逧・↑蠖｢蠑上ｒ繝代・繧ｹ
            from dateutil import parser
            pub_time = parser.parse(published_date)
        else:
            # struct_time 縺ｮ蝣ｴ蜷・            pub_time = datetime(*published_date[:6], tzinfo=timezone.utc)
        
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours_back)
        return pub_time > cutoff_time
    except:
        return True

def fetch_feed_items(url, source_name, max_items=25):
    """繝輔ぅ繝ｼ繝峨°繧芽ｨ倅ｺ九ｒ蜿門ｾ・"""
    try:
        print(f"藤 蜿門ｾ嶺ｸｭ: {source_name} ({url})")
        
        # User-Agent繧定ｨｭ螳・        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; AI-News-Bot/1.0)'
        }
        
        # 繧ｿ繧､繝繧｢繧ｦ繝井ｻ倥″縺ｧ蜿門ｾ・        import urllib.request
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            feed_data = response.read()
        
        # feedparser縺ｧ隗｣譫・        feed = feedparser.parse(feed_data)
        items = []
        
        for entry in feed.entries[:max_items]:
            # 譛霑代・險倅ｺ九・縺ｿ
            if not is_recent(entry.get('published_parsed'), HOURS_LOOKBACK):
                continue
            
            item = {
                'title': entry.get('title', '').strip(),
                'url': entry.get('link', ''),
                'summary': entry.get('summary', entry.get('description', '')),
                'published': entry.get('published', ''),
                'source': source_name,
                'engineer_score': 0.0
            }
            
            # HTML繧ｿ繧ｰ繧帝勁蜴ｻ
            item['summary'] = re.sub(r'<[^>]+>', '', item['summary'])
            item['summary'] = html.unescape(item['summary']).strip()
            
            # 繧ｨ繝ｳ繧ｸ繝九い髢｢騾｣蠎ｦ繧ｹ繧ｳ繧｢險育ｮ・            item['engineer_score'] = SimpleEngineerRanking.calculate_score(item)
            
            items.append(item)
        
        print(f"笨・{source_name}: {len(items)}莉ｶ蜿門ｾ・)
        return items
        
    except Exception as e:
        print(f"笶・{source_name} 繧ｨ繝ｩ繝ｼ: {e}")
        return []

def _clean_tweet_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"https?://\S+", "", text)  # URLs蜑企勁
    text = re.sub(r"\s+", " ", text).strip()  # 菴吝・縺ｪ遨ｺ逋ｽ繧貞悸邵ｮ
    text = re.sub(r"(#[\w荳-鮴･縺・繧薙ぃ-繝ｳ繝ｼ]+\s*)+$", "", text)  # 譛ｫ蟆ｾ縺ｮ繝上ャ繧ｷ繝･繧ｿ繧ｰ鄒､繧貞炎髯､
    text = re.sub(r"(@[\w_]+\s*)+$", "", text)  # 譛ｫ蟆ｾ縺ｮ繝｡繝ｳ繧ｷ繝ｧ繝ｳ鄒､繧貞炎髯､
    return text.strip()

def _extract_external_url(text: str) -> str | None:
    if not text:
        return None
    urls = re.findall(r"https?://\S+", text)
    for u in urls:
        try:
            host = urlparse(u).netloc.lower()
            if any(x in host for x in ["x.com", "twitter.com", "t.co"]):
                continue
            return u
        except Exception:
            continue
    return None

def _fetch_og_title(url: str, timeout: int = 8) -> str | None:
    if not url:
        return None
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; AI-News-Bot/1.0)'}
        resp = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, 'html.parser')
        tag = soup.find('meta', attrs={'property': 'og:title'})
        if tag and tag.get('content'):
            return tag.get('content').strip()
        if soup.title and soup.title.string:
            return soup.title.string.strip()
    except Exception:
        return None
    return None

def _username_from_status_url(x_status_url: str) -> str | None:
    try:
        p = urlparse(x_status_url)
        parts = [seg for seg in p.path.split('/') if seg]
        if len(parts) >= 2 and parts[0].lower() not in ("i",):
            return parts[0]
    except Exception:
        return None
    return None

def _guess_tag(text: str) -> str | None:
    t = (text or '').lower()
    jp = (text or '')
    # 螳溯｣・繝√Η繝ｼ繝医Μ繧｢繝ｫ邉ｻ
    if any(k in t for k in ['how to', 'tutorial', 'guide', 'step-by-step']) or any(k in jp for k in ['菴ｿ縺・婿', '謇矩・, '蜈･髢', '繝√Η繝ｼ繝医Μ繧｢繝ｫ']):
        return '螳溯｣・
    # 讌ｭ蜍吝柑邇・喧/閾ｪ蜍募喧邉ｻ
    if any(k in t for k in ['workflow', 'automation', 'automate', 'copilot', 'zapier', 'notion', 'excel', 'apps script', 'power automate', 'prompt']) or any(k in jp for k in ['蜉ｹ邇・喧', '閾ｪ蜍募喧', '譎ら洒']):
        return '蜉ｹ邇・喧'
    # 遐皮ｩｶ/隲匁枚邉ｻ
    if any(k in t for k in ['arxiv', 'paper', 'research']) or any(k in jp for k in ['隲匁枚', '遐皮ｩｶ']):
        return '遐皮ｩｶ'
    # 繝ｪ繝ｪ繝ｼ繧ｹ/逋ｺ陦ｨ
    if any(k in t for k in ['release', 'launch', 'announce', 'announced']) or any(k in jp for k in ['逋ｺ陦ｨ', '繝ｪ繝ｪ繝ｼ繧ｹ']):
        return '逋ｺ陦ｨ'
    return None

def _build_readable_summary(cleaned: str, og_title: str | None, domain: str | None) -> str:
    tag = _guess_tag((og_title or '') + ' ' + (cleaned or ''))
    parts = []
    if tag:
        parts.append(f"[{tag}]")
    if og_title:
        parts.append(og_title.strip())
    # 謚慕ｨｿ隕∫ｴ・・驥崎､・＠縺ｪ縺・→縺阪・縺ｿ豺ｻ縺医ｋ
    if cleaned:
        if not og_title or og_title.lower() not in cleaned.lower():
            # 遏ｭ縺乗紛蠖｢
            brief = cleaned.strip()
            if len(brief) > 140:
                brief = brief[:140] + '...'
            parts.append(f"謚慕ｨｿ隕∫ｴ・ {brief}")
    if domain:
        parts.append(f"蜃ｺ蜈ｸ: {domain}")
    # 莉穂ｸ翫￡・亥・隗貞玄蛻・ｊ縺ｧ隕冶ｪ肴ｧ蜷台ｸ奇ｼ・    summary = ' ・・'.join(p for p in parts if p)
    # 譛邨る聞縺穂ｸ企剞
    if len(summary) > 280:
        summary = summary[:277] + '...'
    return summary

def fetch_x_posts():
    """X(Twitter)謚慕ｨｿ繧貞叙蠕・"""
    try:
        print(f"導 X謚慕ｨｿ蜿門ｾ嶺ｸｭ: {X_POSTS_CSV}")
        
        response = requests.get(X_POSTS_CSV, timeout=30)
        print(f"倹 HTTP Response: {response.status_code}")
        if response.status_code != 200:
            print(f"笶・HTTP Status: {response.status_code}")
            return []
        
        content = response.text.strip()
        print(f"塘 蜿嶺ｿ｡繝・・繧ｿ繧ｵ繧､繧ｺ: {len(content)} 譁・ｭ・)
        print(f"塘 繝・・繧ｿ蜈磯ｭ100譁・ｭ・ {content[:100]}")
        
        # CSV縺九ユ繧ｭ繧ｹ繝医°繧貞愛螳・        if content.startswith('"Timestamp"') or ',' in content[:200]:
            print("搭 CSV蠖｢蠑上→縺励※蜃ｦ逅・ｸｭ...")
            return fetch_x_posts_from_csv(content)
        else:
            print("塘 繝・く繧ｹ繝亥ｽ｢蠑上→縺励※蜃ｦ逅・ｸｭ...")
            return fetch_x_posts_from_text(content)
            
    except Exception as e:
        print(f"笶・X謚慕ｨｿ蜿門ｾ励お繝ｩ繝ｼ: {e}")
        import traceback
        traceback.print_exc()
        return []

def fetch_x_posts_from_csv(csv_content):
    """CSV蠖｢蠑上・X繝昴せ繝医ｒ蜃ｦ逅・"""
    try:
        # CSV繝輔ぃ繧､繝ｫ縺ｫ蛻怜錐縺後↑縺・ｴ蜷医↓蟇ｾ蠢懶ｼ医う繝ｳ繝・ャ繧ｯ繧ｹ繝吶・繧ｹ縺ｧ蜃ｦ逅・ｼ・        lines = csv_content.strip().split('\n')
        posts = []
        og_cache: dict[str, str] = {}
        
        print(f"剥 DEBUG: CSV陦梧焚: {len(lines)}")
        print(f"剥 DEBUG: 譛蛻昴・3陦・")
        for i, line in enumerate(lines[:3]):
            print(f"  陦鶏i}: {line[:100]}...")
        
        for i, line in enumerate(lines):
            try:
                # CSV繧呈焔蜍輔〒隗｣譫撰ｼ亥・蜷阪↑縺励ｒ諠ｳ螳夲ｼ・                parts = list(csv.reader([line]))[0]
                
                if len(parts) < 3:  # 譛菴・蛻怜ｿ・ｦ・                    continue
                
                # CSV蠖｢蠑・ [timestamp, username, content, image_url, tweet_url]
                timestamp_str = parts[0].strip()
                username = parts[1].strip().lstrip('@')  # @險伜捷繧帝勁蜴ｻ
                tweet_content = parts[2].strip()
                
                # 繝・う繝ｼ繝・RL縺ｯ4蛻礼岼縺ｾ縺溘・5蛻礼岼
                tweet_url = ''
                if len(parts) > 4:
                    tweet_url = parts[4].strip()
                elif len(parts) > 3:
                    tweet_url = parts[3].strip()
                
                print(f"剥 DEBUG: 陦鶏i+1} - 繝ｦ繝ｼ繧ｶ繝ｼ: @{username}, 繧ｳ繝ｳ繝・Φ繝・ {tweet_content[:50]}..., URL: {tweet_url}")
                
                if not tweet_content or not username:
                    continue
                
                # 譌･莉倥メ繧ｧ繝・け
                try:
                    from dateutil import parser
                    post_date = parser.parse(timestamp_str)
                    if not is_recent(post_date.strftime('%Y-%m-%d %H:%M:%S'), HOURS_LOOKBACK):
                        print(f"剥 DEBUG: 蜿､縺・兜遞ｿ繧偵せ繧ｭ繝・・: {timestamp_str}")
                        continue
                except Exception as e:
                    print(f"笞・・譌･莉倩ｧ｣譫舌お繝ｩ繝ｼ: {timestamp_str} - {e}")
                    continue

                # 繝・く繧ｹ繝医け繝ｪ繝ｼ繝九Φ繧ｰ
                cleaned = _clean_tweet_text(tweet_content)
                
                # 螟夜ΚURL繧呈歓蜃ｺ
                ext_url = _extract_external_url(tweet_content)
                
                # 繝・う繝ｼ繝・RL閾ｪ菴薙ｒ螟夜ΚURL縺ｨ縺励※菴ｿ逕ｨ・井ｻ悶↓驕ｩ蛻・↑URL縺後↑縺・ｴ蜷茨ｼ・                if not ext_url and tweet_url:
                    # Twitter縺ｮURL縺ｧ縺ｯ縺ｪ縺・ｴ蜷医・縺ｿ菴ｿ逕ｨ
                    if 'twitter.com' not in tweet_url and 'x.com' not in tweet_url:
                        ext_url = tweet_url

                domain = urlparse(ext_url).netloc if ext_url else ''
                og_title = None
                
                # OG繧ｿ繧､繝医Ν蜿門ｾ・                if ext_url:
                    og_title = og_cache.get(ext_url)
                    if og_title is None:
                        og_title = _fetch_og_title(ext_url)
                        if og_title:
                            og_cache[ext_url] = og_title

                # 繧ｿ繧､繝医Ν逕滓・
                if og_title:
                    title = f"凄 @{username}: {og_title}"
                else:
                    title = f"凄 @{username}: {cleaned[:80]}" if len(cleaned) > 80 else f"凄 @{username}: {cleaned}"

                # 隕∫ｴ・函謌・                summary = _build_readable_summary(cleaned, og_title, domain)
                if not summary:
                    summary = cleaned[:200] + '...' if len(cleaned) > 200 else cleaned

                source_label = f"X @{username}"
                score_payload = {'title': title, 'summary': summary, 'url': ext_url or tweet_url}

                posts.append({
                    'title': title,
                    'url': ext_url or tweet_url or '',
                    'summary': summary,
                    'published': timestamp_str,
                    'source': source_label,
                    'engineer_score': SimpleEngineerRanking.calculate_score(score_payload)
                })
                
                print(f"笨・X謚慕ｨｿ蜃ｦ逅・ｮ御ｺ・ @{username} - 繧ｹ繧ｳ繧｢: {SimpleEngineerRanking.calculate_score(score_payload):.1f}")
                
            except Exception as e:
                print(f"笞・・陦鶏i+1}縺ｮ蜃ｦ逅・お繝ｩ繝ｼ: {e}")
                continue
        
        print(f"笨・CSV蠖｢蠑醜謚慕ｨｿ: {len(posts)}莉ｶ蜿門ｾ・)
        return posts[:MAX_ITEMS_PER_CATEGORY]
        
    except Exception as e:
        print(f"笶・CSV蜃ｦ逅・お繝ｩ繝ｼ: {e}")
        import traceback
        traceback.print_exc()
        return []

def fetch_x_posts_from_text(text_content):
    """繝・く繧ｹ繝亥ｽ｢蠑上・X繝昴せ繝医ｒ蜃ｦ逅・"""
    try:
        import re
        
        # 譌･莉倥ヱ繧ｿ繝ｼ繝ｳ縺ｧ繝昴せ繝医ｒ蛻・牡
        posts = []
        
        # August XX, 2025 蠖｢蠑上・譌･莉倥ｒ讀懃ｴ｢
        date_pattern = r'(August \d{1,2}, 2025 at \d{1,2}:\d{2}[AP]M)'
        username_pattern = r'@([a-zA-Z0-9_]+)'
        url_pattern = r'https?://[^\s,"]+'
        
        # 繝・く繧ｹ繝医ｒ陦後〒蛻・牡縺励※蜃ｦ逅・        lines = text_content.split('\n')
        current_post = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 譌･莉倥ｒ讀懷・
            date_match = re.search(date_pattern, line)
            if date_match:
                # 蜑阪・繝昴せ繝医ｒ菫晏ｭ・                if current_post.get('content'):
                    posts.append(current_post.copy())
                
                # 譁ｰ縺励＞繝昴せ繝医ｒ髢句ｧ・                current_post = {
                    'timestamp': date_match.group(1),
                    'content': '',
                    'urls': [],
                    'username': ''
                }
                continue
            
            # 繝ｦ繝ｼ繧ｶ繝ｼ蜷阪ｒ讀懷・
            username_match = re.search(username_pattern, line)
            if username_match and not current_post.get('username'):
                current_post['username'] = username_match.group(1)
            
            # URL繧呈､懷・
            url_matches = re.findall(url_pattern, line)
            for url in url_matches:
                if url not in current_post['urls']:
                    current_post['urls'].append(url)
            
            # 繧ｳ繝ｳ繝・Φ繝・ｒ闢・ｩ・            if not re.search(date_pattern, line):  # 譌･莉倩｡御ｻ･螟・                if current_post.get('content'):
                    current_post['content'] += ' ' + line
                else:
                    current_post['content'] = line
        
        # 譛蠕後・繝昴せ繝医ｒ霑ｽ蜉
        if current_post.get('content'):
            posts.append(current_post)
        
        # 繝昴せ繝医が繝悶ず繧ｧ繧ｯ繝医↓螟画鋤
        converted_posts = []
        og_cache: dict[str, str] = {}
        for post_data in posts[:MAX_ITEMS_PER_CATEGORY]:
            if not post_data.get('content'):
                continue
            
            # 譌･莉倥メ繧ｧ繝・け・域怙霑・8譎る俣莉･蜀・ｼ・            try:
                from dateutil import parser
                post_date = parser.parse(post_data['timestamp'])
                if not is_recent(post_date.strftime('%Y-%m-%d %H:%M:%S'), HOURS_LOOKBACK):
                    continue
            except:
                continue
            
            cleaned = _clean_tweet_text(post_data['content'])
            ext_url = None
            for u in post_data.get('urls', []):
                host = urlparse(u).netloc.lower()
                if not any(x in host for x in ["x.com", "twitter.com", "t.co"]):
                    ext_url = u
                    break
            domain = urlparse(ext_url).netloc if ext_url else ''
            og_title = None
            if ext_url:
                og_title = og_cache.get(ext_url)
                if og_title is None:
                    og_title = _fetch_og_title(ext_url)
                    if og_title:
                        og_cache[ext_url] = og_title

            if og_title:
                title = f"{og_title}・・domain}・・
            else:
                title = cleaned if len(cleaned) <= 100 else (cleaned[:100] + '...')

            summary = _build_readable_summary(cleaned, og_title, domain)

            source_label = f"X @{post_data.get('username', 'unknown')}"
            score_payload = {'title': title, 'summary': summary or cleaned, 'url': ext_url or ''}
            converted_posts.append({
                'title': title,
                'url': ext_url or '',
                'summary': summary or cleaned,
                'published': post_data['timestamp'],
                'source': source_label,
                'engineer_score': SimpleEngineerRanking.calculate_score(score_payload)
            })
        
        print(f"笨・繝・く繧ｹ繝亥ｽ｢蠑醜謚慕ｨｿ: {len(converted_posts)}莉ｶ蜿門ｾ・)
        return converted_posts
        
    except Exception as e:
        print(f"笶・繝・く繧ｹ繝亥・逅・お繝ｩ繝ｼ: {e}")
        import traceback
        traceback.print_exc()
        return []

def format_time_ago(published_str):
    """邨碁℃譎る俣繧呈律譛ｬ隱槭〒陦ｨ遉ｺ"""
    if not published_str:
        return ""
    
    try:
        from dateutil import parser
        pub_time = parser.parse(published_str)
        now = datetime.now(timezone.utc)
        
        if pub_time.tzinfo is None:
            pub_time = pub_time.replace(tzinfo=timezone.utc)
        
        diff = now - pub_time
        hours = diff.total_seconds() / 3600
        
        if hours < 1:
            return "1譎る俣譛ｪ貅"
        elif hours < 24:
            return f"{int(hours)}譎る俣蜑・
        else:
            return f"{int(hours // 24)}譌･蜑・
    except:
        return ""

def generate_css():
    """CSS繝輔ぃ繧､繝ｫ繧堤函謌・"""
    css_content = '''/* Digital.gov compliance deployed at 2025-08-23 */
:root{
  /* Digital.gov貅匁侠: WCAG AAA蟇ｾ蠢懊き繝ｩ繝ｼ繧ｷ繧ｹ繝・Β */
  --fg:#0f172a; --bg:#ffffff; --muted:#475569; --line:#e2e8f0;
  --brand:#1e40af; --brand-weak:#f1f5f9; --chip:#f8fafc;
  --brand-hover:#1e3a8a; --brand-light:#bfdbfe; --brand-dark:#1e3a8a;
  --success:#15803d; --warning:#ca8a04; --danger:#dc2626;
  --info:#0369a1; --neutral:#64748b;
  
  /* 谿ｵ髫守噪閭梧勹濶ｲ・亥ｽｩ蠎ｦ繧剃ｸ九￡縺溯レ譎ｯ・・*/
  --bg-subtle:#f8fafc; --bg-muted:#f1f5f9; --bg-emphasis:#e2e8f0;
  
  /* 繧ｰ繝ｩ繝・・繧ｷ繝ｧ繝ｳ・亥ｽｩ蠎ｦ隱ｿ謨ｴ貂医∩・・*/
  --gradient:linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  --gradient-subtle:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  
  /* 繧ｷ繝｣繝峨え */
  --shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg:0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  /* 繝ｬ繧､繧｢繧ｦ繝亥､画焚 */
  --border-radius: 12px;
  --spacing-xs: 4px; --spacing-sm: 8px; --spacing-md: 16px; 
  --spacing-lg: 24px; --spacing-xl: 32px; --spacing-2xl: 48px;
  
  /* 繧ｿ繧､繝昴げ繝ｩ繝輔ぅ */
  --font-size-xs: 12px; --font-size-sm: 14px; --font-size-base: 16px;
  --font-size-lg: 18px; --font-size-xl: 20px; --font-size-2xl: 24px;
  --font-size-3xl: 32px; --font-size-4xl: 36px;
  
  /* 繝輔か繝ｼ繧ｫ繧ｹ陦ｨ遉ｺ */
  --focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.5);
  --focus-ring-offset: 2px;
}
*{box-sizing:border-box}
body{
  margin:0;
  background:var(--bg);
  color:var(--fg);
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans JP',sans-serif;
  font-size:var(--font-size-base);
  line-height:1.6;
  scroll-behavior:smooth;
}
.container{
  max-width:1000px;
  margin:0 auto;
  padding:var(--spacing-lg) var(--spacing-md);
  display:flex;
  flex-direction:column;
  gap:var(--spacing-lg);
}

/* 繝倥ャ繝繝ｼ */
.site-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:var(--spacing-md);
  background:var(--bg-subtle);
  border-bottom:1px solid var(--line);
  margin-bottom:var(--spacing-lg);
}
.brand{
  font-size:var(--font-size-xl);
  font-weight:700;
  color:var(--brand);
}
.updated{
  color:var(--muted);
  font-size:var(--font-size-sm);
}

/* 繝｡繧､繝ｳ繧ｳ繝ｳ繝・Φ繝・*/
.page-title{
  font-size:var(--font-size-3xl);
  font-weight:800;
  text-align:center;
  margin:0 0 var(--spacing-md);
  background:var(--gradient);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}
.lead{
  text-align:center;
  color:var(--muted);
  font-size:var(--font-size-lg);
  margin:0 0 var(--spacing-xl);
  max-width:600px;
  margin-left:auto;
  margin-right:auto;
}

/* KPI繧ｰ繝ｪ繝・ラ */
.kpi-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
  gap:var(--spacing-md);
  margin-bottom:var(--spacing-xl);
}
.kpi-card{
  background:var(--bg-subtle);
  padding:var(--spacing-md);
  border-radius:var(--border-radius);
  text-align:center;
  border:1px solid var(--line);
}
.kpi-value{
  font-size:var(--font-size-2xl);
  font-weight:800;
  color:var(--brand);
}
.kpi-label{
  font-size:var(--font-size-sm);
  color:var(--muted);
  margin-top:var(--spacing-xs);
}
.kpi-note{
  font-size:var(--font-size-xs);
  color:var(--success);
  margin-top:var(--spacing-xs);
}

/* 繝輔ぅ繝ｫ繧ｿ繝ｼ繧ｳ繝ｳ繝医Ο繝ｼ繝ｫ */
.filters{
  display:flex;
  flex-wrap:wrap;
  gap:var(--spacing-sm);
  align-items:center;
  padding:var(--spacing-md);
  background:var(--bg-subtle);
  border-radius:var(--border-radius);
  margin-bottom:var(--spacing-lg);
}
.filter-group{
  display:flex;
  align-items:center;
  gap:var(--spacing-sm);
}
.filter-label{
  font-size:var(--font-size-sm);
  color:var(--muted);
  font-weight:600;
}
.filter-select, .filter-input{
  padding:var(--spacing-xs) var(--spacing-sm);
  border:1px solid var(--line);
  border-radius:calc(var(--border-radius) / 2);
  font-size:var(--font-size-sm);
  background:var(--bg);
}
.filter-select:focus, .filter-input:focus{
  outline:none;
  border-color:var(--brand);
  box-shadow:var(--focus-ring);
}

/* 繧ｿ繝悶リ繝薙ご繝ｼ繧ｷ繝ｧ繝ｳ */
.tabs{
  display:flex;
  border-bottom:2px solid var(--line);
  margin-bottom:var(--spacing-lg);
  overflow-x:auto;
}
.tab-button{
  background:none;
  border:none;
  padding:var(--spacing-md) var(--spacing-lg);
  font-size:var(--font-size-base);
  font-weight:600;
  color:var(--muted);
  cursor:pointer;
  border-bottom:3px solid transparent;
  white-space:nowrap;
  transition:all 0.2s;
}
.tab-button:hover{
  color:var(--fg);
  background:var(--bg-subtle);
}
.tab-button.active{
  color:var(--brand);
  border-bottom-color:var(--brand);
  background:var(--brand-weak);
}
.tab-button:focus{
  outline:none;
  box-shadow:var(--focus-ring);
}

/* 繧ｿ繝悶さ繝ｳ繝・Φ繝・*/
.tab-content{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
  gap:var(--spacing-md);
}
.tab-panel{
  transition:opacity 0.3s ease;
}
.tab-panel.hidden{
  display:none;
}

/* 繧ｫ繝ｼ繝・*/
.enhanced-card{
  background:var(--bg);
  border:1px solid var(--line);
  border-radius:var(--border-radius);
  padding:var(--spacing-md);
  box-shadow:var(--shadow);
  transition:all 0.3s ease;
  position:relative;
}
.enhanced-card:hover{
  transform:translateY(-2px);
  box-shadow:var(--shadow-lg);
  border-color:var(--brand-light);
}
.card-priority{
  position:absolute;
  top:var(--spacing-sm);
  right:var(--spacing-sm);
  background:var(--brand);
  color:white;
  padding:var(--spacing-xs) var(--spacing-sm);
  border-radius:calc(var(--border-radius) / 2);
  font-size:var(--font-size-xs);
  font-weight:600;
}
.card-priority.high{background:var(--success)}
.card-priority.medium{background:var(--warning)}
.card-priority.low{background:var(--neutral)}
.card-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  margin-bottom:var(--spacing-sm);
}
.card-title{
  font-size:var(--font-size-lg);
  font-weight:700;
  line-height:1.3;
  margin:0;
}
.card-title a{
  color:var(--fg);
  text-decoration:none;
}
.card-title a:hover{
  color:var(--brand);
  text-decoration:underline;
}
.card-meta{
  display:flex;
  gap:var(--spacing-sm);
  font-size:var(--font-size-xs);
  color:var(--muted);
  margin-bottom:var(--spacing-sm);
}
.card-source{
  background:var(--chip);
  padding:var(--spacing-xs) var(--spacing-sm);
  border-radius:calc(var(--border-radius) / 3);
  font-weight:600;
}
.card-summary{
  color:var(--fg);
  line-height:1.5;
  margin:var(--spacing-sm) 0;
}
.card-footer{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-top:var(--spacing-sm);
  padding-top:var(--spacing-sm);
  border-top:1px solid var(--line);
}
.card-score{
  font-size:var(--font-size-sm);
  font-weight:600;
  color:var(--info);
}
.card-time{
  font-size:var(--font-size-xs);
  color:var(--muted);
}

/* 繝ｬ繧ｹ繝昴Φ繧ｷ繝・*/
@media (max-width: 768px) {
  .container{
    padding:var(--spacing-md) var(--spacing-sm);
  }
  .page-title{
    font-size:var(--font-size-2xl);
  }
  .lead{
    font-size:var(--font-size-base);
  }
  .filters{
    flex-direction:column;
    align-items:stretch;
  }
  .filter-group{
    justify-content:space-between;
  }
  .tabs{
    justify-content:space-around;
  }
  .tab-button{
    flex:1;
    padding:var(--spacing-sm);
    font-size:var(--font-size-sm);
  }
  .tab-content{
    grid-template-columns:1fr;
  }
}

/* 繧｢繧ｯ繧ｻ繧ｷ繝薙Μ繝・ぅ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 繝上う繧ｳ繝ｳ繝医Λ繧ｹ繝医Δ繝ｼ繝牙ｯｾ蠢・*/
@media (prefers-contrast: high) {
  :root {
    --line: #000000;
    --muted: #000000;
  }
  .enhanced-card {
    border-width: 2px;
  }
}

/* 繝繝ｼ繧ｯ繝｢繝ｼ繝牙ｯｾ蠢・*/
@media (prefers-color-scheme: dark) {
  :root {
    --fg: #f1f5f9;
    --bg: #0f172a;
    --muted: #94a3b8;
    --line: #334155;
    --bg-subtle: #1e293b;
    --bg-muted: #334155;
    --chip: #1e293b;
  }
}
'''
    return css_content

def main():
    """繝｡繧､繝ｳ蜃ｦ逅・"""
    print("噫 Simple Enhanced Daily AI News Builder")
    print("=" * 50)
    
    # JST譎る俣繧貞叙蠕・    jst = timezone(timedelta(hours=9))
    now = datetime.now(jst).strftime('%Y-%m-%d %H:%M JST')
    
    print(f"套 逕滓・譌･譎・ {now}")
    print(f"竢ｰ 驕主悉 {HOURS_LOOKBACK} 譎る俣縺ｮ險倅ｺ九ｒ蜿朱寔")
    print(f"投 繧ｫ繝・ざ繝ｪ蛻･譛螟ｧ {MAX_ITEMS_PER_CATEGORY} 莉ｶ")
    print(f"訣 鄙ｻ險ｳ: {'譛牙柑' if TRANSLATE_TO_JA else '辟｡蜉ｹ'}")
    
    # 鄙ｻ險ｳ繧ｭ繝｣繝・す繝･隱ｭ縺ｿ霎ｼ縺ｿ
    translation_cache = load_translation_cache()
    
    # 繝輔ぅ繝ｼ繝芽ｨｭ螳夊ｪｭ縺ｿ霎ｼ縺ｿ
    feeds_config = load_feeds_config()
    
    # 蜷・き繝・ざ繝ｪ縺ｮ繝・・繧ｿ蜿朱寔
    all_categories = {}
    
    for category, feeds in feeds_config.items():
        print(f"\n唐 {category.upper()} 繧ｫ繝・ざ繝ｪ蜃ｦ逅・ｸｭ...")
        
        category_items = []
        for feed_config in feeds:
            items = fetch_feed_items(
                feed_config['url'], 
                feed_config['name'], 
                MAX_ITEMS_PER_CATEGORY
            )
            category_items.extend(items)
        
        # X謚慕ｨｿ繧りｿｽ蜉・・osts繧ｫ繝・ざ繝ｪ縺ｮ縺ｿ・・        if category == 'posts':
            print(f"剥 DEBUG: posts繧ｫ繝・ざ繝ｪ縺ｧX謚慕ｨｿ蜿門ｾ鈴幕蟋・..")
            print(f"剥 DEBUG: X_POSTS_CSV迺ｰ蠅・､画焚 = {X_POSTS_CSV}")
            print(f"剥 DEBUG: HOURS_LOOKBACK = {HOURS_LOOKBACK}")
            
            x_items = fetch_x_posts()
            print(f"剥 DEBUG: X謚慕ｨｿ蜿門ｾ怜ｮ御ｺ・- {len(x_items)}莉ｶ")
            
            if x_items:
                # X繝昴せ繝医・繧ｹ繧ｳ繧｢繧貞ｼｷ蛻ｶ逧・↓鬮倥￥縺励※蜆ｪ蜈郁｡ｨ遉ｺ
                for i, item in enumerate(x_items):
                    item['engineer_score'] = 10.0  # 譛鬮倥せ繧ｳ繧｢險ｭ螳・                    print(f"剥 DEBUG: X繝昴せ繝・{i+1}] - 繧ｿ繧､繝医Ν: {item['title'][:50]}... (繧ｹ繧ｳ繧｢: {item['engineer_score']})")
                    print(f"剥 DEBUG: X繝昴せ繝・{i+1}] - URL: {item.get('url', 'N/A')}")
                
                # X繝昴せ繝医ｒ category_items 縺ｫ霑ｽ蜉
                category_items.extend(x_items)
                print(f"剥 DEBUG: X繝昴せ繝育ｵｱ蜷亥ｾ後・邱剰ｨ倅ｺ区焚: {len(category_items)}莉ｶ")
            else:
                print(f"笞・・DEBUG: X謚慕ｨｿ縺悟叙蠕励＆繧後∪縺帙ｓ縺ｧ縺励◆ - 蜴溷屏隱ｿ譟ｻ縺悟ｿ・ｦ・)
        
        # 繧ｨ繝ｳ繧ｸ繝九い髢｢騾｣蠎ｦ縺ｧ繧ｽ繝ｼ繝・        category_items.sort(key=lambda x: x['engineer_score'], reverse=True)
        category_items = category_items[:MAX_ITEMS_PER_CATEGORY]
        
        # 鄙ｻ險ｳ蜃ｦ逅・        if TRANSLATE_TO_JA:
            print(f"訣 {category} 繧ｫ繝・ざ繝ｪ鄙ｻ險ｳ荳ｭ...")
            for item in category_items:
                if item['title'] and not all(ord(c) < 128 for c in item['title']):
                    # 縺吶〒縺ｫ譌･譛ｬ隱槭・蝣ｴ蜷医・繧ｹ繧ｭ繝・・
                    continue
                    
                item['title_ja'] = translate_text(item['title'], 'ja', translation_cache)
                if item['summary']:
                    item['summary_ja'] = translate_text(item['summary'], 'ja', translation_cache)
        
        all_categories[category.lower()] = category_items
        print(f"笨・{category}: {len(category_items)}莉ｶ (蟷ｳ蝮・せ繧ｳ繧｢: {sum(item['engineer_score'] for item in category_items) / len(category_items):.1f})")
        print(f"   竊・all_categories['{category.lower()}'] 縺ｫ菫晏ｭ・)
    
    # 鄙ｻ險ｳ繧ｭ繝｣繝・す繝･菫晏ｭ・    if TRANSLATE_TO_JA:
        save_translation_cache(translation_cache)
        print("沈 鄙ｻ險ｳ繧ｭ繝｣繝・す繝･菫晏ｭ伜ｮ御ｺ・)
    
    # 邨ｱ險域ュ蝣ｱ
    total_items = sum(len(items) for items in all_categories.values())
    high_priority = sum(1 for items in all_categories.values() for item in items if item['engineer_score'] >= 7.0)
    
    print(f"\n投 蜿朱寔邨先棡:")
    print(f"   邱剰ｨ倅ｺ区焚: {total_items}莉ｶ")
    print(f"   鬮伜━蜈亥ｺｦ: {high_priority}莉ｶ")
    print(f"   諠・ｱ貅・ {sum(len(feeds) for feeds in feeds_config.values())}蛟・)
    
    # Top Picks・亥・繧ｫ繝・ざ繝ｪ讓ｪ譁ｭ縺ｮ荳贋ｽ搾ｼ・    all_items_flat = [it for items in all_categories.values() for it in items]
    # URL驥崎､・勁蜴ｻ・亥・縺ｫ鬮倥せ繧ｳ繧｢縺ｫ荳ｦ縺ｹ縺ｦ縺九ｉ繝ｦ繝九・繧ｯ蛹厄ｼ・    all_items_flat.sort(key=lambda x: x['engineer_score'], reverse=True)
    seen = set()
    top_picks = []
    for it in all_items_flat:
        u = it.get('url')
        if u and u not in seen:
            top_picks.append(it)
            seen.add(u)
        if len(top_picks) >= TOP_PICKS_COUNT:
            break

    # HTML繝・Φ繝励Ξ繝ｼ繝・    html_template = f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Daily AI News 窶・{now}</title>
  <link rel="stylesheet" href="style.css"/>
</head>
<body>
  <header class="site-header">
    <div class="brand">堂 Daily AI News</div>
    <div class="updated">譛邨よ峩譁ｰ・嘴now}</div>
  </header>

  <main class="container">
    <h1 class="page-title">莉頑律縺ｮ譛譁ｰAI諠・ｱ</h1>
    <p class="lead">
        譛臥畑蠎ｦ繧ｹ繧ｳ繧｢縺ｧ繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ陦ｨ遉ｺ・・I繧ｨ繝ｳ繧ｸ繝九い/讌ｭ蜍吝柑邇・喧蜷代￠・峨ょｮ溯｣・庄閭ｽ諤ｧ繝ｻ蜉ｹ邇・喧蜉ｹ譫懊・蟄ｦ鄙剃ｾ｡蛟､繧帝㍾隕悶＠縺ｦ閾ｪ蜍輔た繝ｼ繝医・        雎雁ｯ後↑諠・ｱ驥擾ｼ・total_items}莉ｶ・峨ｒ邯ｭ謖√＠縺､縺､縲・㍾隕∝ｺｦ縺ｧ謨ｴ逅・｡ｨ遉ｺ縲・    </p>

    <section class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-value">{total_items}莉ｶ</div>
        <div class="kpi-label">邱剰ｨ倅ｺ区焚</div>
        <div class="kpi-note">諠・ｱ驥冗ｶｭ謖・/div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">{high_priority}莉ｶ</div>
        <div class="kpi-label">鬮伜━蜈亥ｺｦ險倅ｺ・/div>
        <div class="kpi-note">繧ｹ繧ｳ繧｢7.0+</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">{sum(len(feeds) for feeds in feeds_config.values())}蛟・/div>
        <div class="kpi-label">諠・ｱ貅・/div>
        <div class="kpi-note">螟夊ｧ堤噪蜿朱寔</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">{HOURS_LOOKBACK}h</div>
        <div class="kpi-label">蜿朱寔遽・峇</div>
        <div class="kpi-note">譛譁ｰ諤ｧ驥崎ｦ・/div>
      </div>
    </section>

    <!-- Top Picks: 譛臥畑蠎ｦ荳贋ｽ・-->
    <section class="top-picks" aria-label="Top Picks">
      <h2 class="section-title">醇 Top Picks 窶・譛臥畑蠎ｦ荳贋ｽ搾ｼ井ｸ贋ｽ・{min(TOP_PICKS_COUNT, len(top_picks))} 莉ｶ・・/h2>
      <div class="tab-content">
'''

    for item in top_picks:
        score = item['engineer_score']
        if score >= 7.0:
            priority = 'high'; priority_text = '鬮・
        elif score >= 4.0:
            priority = 'medium'; priority_text = '荳ｭ'
        else:
            priority = 'low'; priority_text = '菴・

        display_title = item.get('title_ja', item['title'])
        display_summary = item.get('summary_ja', item['summary'])
        time_ago = format_time_ago(item['published'])

        html_template += f'''
        <article class="enhanced-card" data-score="{score:.1f}" data-source="{item['source']}" data-time="{item['published']}">
          <div class="card-priority {priority}">{priority_text} {score:.1f}</div>
          <header class="card-header">
            <h3 class="card-title">
              <a href="{item['url']}" target="_blank" rel="noopener">{html.escape(display_title)}</a>
            </h3>
          </header>
          <div class="card-meta">
            <span class="card-source">{item['source']}</span>
            {f'<span class="card-time">{time_ago}</span>' if time_ago else ''}
          </div>
          <div class="card-summary">{html.escape(display_summary[:200] + '...' if len(display_summary) > 200 else display_summary)}</div>
          <footer class="card-footer">
            <span class="card-score">譛臥畑蠎ｦ: {score:.1f}</span>
            <span class="card-time">{time_ago}</span>
          </footer>
        </article>
'''

    html_template += '''
      </div>
    </section>

    <section class="filters">
      <div class="filter-group">
        <label class="filter-label">讀懃ｴ｢:</label>
        <input type="text" id="searchInput" class="filter-input" placeholder="繧ｭ繝ｼ繝ｯ繝ｼ繝画､懃ｴ｢..."/>
      </div>
      <div class="filter-group">
        <label class="filter-label">驥崎ｦ∝ｺｦ:</label>
        <select id="importanceFilter" class="filter-select">
          <option value="all">縺吶∋縺ｦ</option>
          <option value="high">鬮・(7.0+)</option>
          <option value="medium">荳ｭ (4.0-6.9)</option>
          <option value="low">菴・(0-3.9)</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">荳ｦ縺ｳ鬆・</label>
        <select id="sortBy" class="filter-select">
          <option value="score">驥崎ｦ∝ｺｦ鬆・/option>
          <option value="time">譁ｰ逹鬆・/option>
          <option value="source">諠・ｱ貅宣・/option>
        </select>
      </div>
    </section>

    <nav class="tabs">
      <button class="tab-button active" data-tab="business">
        嶋 Business ({len(all_categories.get('business', []))})
      </button>
      <button class="tab-button" data-tab="tools">
        肌 Tools ({len(all_categories.get('tools', []))})
      </button>
      <button class="tab-button" data-tab="posts">
        町 Posts ({len(all_categories.get('posts', []))})
      </button>
    </nav>
'''
    
    # 蜷・き繝・ざ繝ｪ縺ｮ繧ｳ繝ｳ繝・Φ繝・函謌撰ｼ・usiness繧呈怙蛻昴↓遒ｺ螳溘↓陦ｨ遉ｺ・・    category_order = ['business', 'tools', 'posts']
    for category_name in category_order:
        # 繧ｫ繝・ざ繝ｪ縺悟ｭ伜惠縺励↑縺・ｴ蜷医・遨ｺ縺ｮ繝ｪ繧ｹ繝医→縺励※謇ｱ縺・        items = all_categories.get(category_name, [])
        print(f"DEBUG: {category_name} 繧ｫ繝・ざ繝ｪ - {len(items)}莉ｶ縺ｮ險倅ｺ・)
        is_active = category_name == 'business'
        panel_class = 'tab-panel' if is_active else 'tab-panel hidden'
        
        html_template += f'''
    <section class="{panel_class}" data-category="{category_name.lower()}">
      <div class="tab-content">
'''
        
        for item in items:
            # 蜆ｪ蜈亥ｺｦ繝ｩ繝吶Ν
            score = item['engineer_score']
            if score >= 7.0:
                priority = 'high'
                priority_text = '鬮・
            elif score >= 4.0:
                priority = 'medium' 
                priority_text = '荳ｭ'
            else:
                priority = 'low'
                priority_text = '菴・
            
            # 繧ｿ繧､繝医Ν縺ｨ隕∫ｴ・ｼ育ｿｻ險ｳ迚医′縺ゅｌ縺ｰ菴ｿ逕ｨ・・            display_title = item.get('title_ja', item['title'])
            display_summary = item.get('summary_ja', item['summary'])
            
            # 譎る俣陦ｨ遉ｺ
            time_ago = format_time_ago(item['published'])
            
            html_template += f'''
        <article class="enhanced-card" data-score="{score:.1f}" data-source="{item['source']}" data-time="{item['published']}">
          <div class="card-priority {priority}">{priority_text} {score:.1f}</div>
          <header class="card-header">
            <h3 class="card-title">
              <a href="{item['url']}" target="_blank" rel="noopener">{html.escape(display_title)}</a>
            </h3>
          </header>
          <div class="card-meta">
            <span class="card-source">{item['source']}</span>
            {f'<span class="card-time">{time_ago}</span>' if time_ago else ''}
          </div>
          <div class="card-summary">{html.escape(display_summary[:200] + '...' if len(display_summary) > 200 else display_summary)}</div>
          <footer class="card-footer">
            <span class="card-score">譛臥畑蠎ｦ: {score:.1f}</span>
            <span class="card-time">{time_ago}</span>
          </footer>
        </article>
'''
        
        html_template += '''
      </div>
    </section>
'''
    
    # JavaScript霑ｽ蜉
    html_template += '''
  </main>

<script>
// 繧ｿ繝門・繧頑崛縺域ｩ溯・
class TabController {
  constructor() {
    this.activeTab = 'business';
    this.init();
  }
  
  init() {
    // 繧ｿ繝悶・繧ｿ繝ｳ縺ｮ繧､繝吶Φ繝医Μ繧ｹ繝翫・
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });
    
    // 繝輔ぅ繝ｫ繧ｿ繝ｼ讖溯・
    this.setupFilters();
    
    // 蛻晄悄陦ｨ遉ｺ・喘usiness繧ｿ繝悶ｒ譏守､ｺ逧・↓陦ｨ遉ｺ
    this.switchTab('business');
  }
  
  switchTab(tabName) {
    if (this.activeTab === tabName) return;
    
    // 繝懊ち繝ｳ縺ｮ迥ｶ諷区峩譁ｰ
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // 繝代ロ繝ｫ縺ｮ陦ｨ遉ｺ蛻・ｊ譖ｿ縺茨ｼ・idden class菴ｿ逕ｨ・・    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.add('hidden');
    });
    document.querySelector(`[data-category="${tabName}"]`).classList.remove('hidden');
    
    this.activeTab = tabName;
    this.updateTabCounts(); // 繧ｿ繝悶き繧ｦ繝ｳ繝域峩譁ｰ
    this.applyFilters(); // 繝輔ぅ繝ｫ繧ｿ繝ｼ蜀埼←逕ｨ
  }
  
  updateTabCounts() {
    // 蜷・ち繝悶・險倅ｺ区焚繧偵き繧ｦ繝ｳ繝医＠縺ｦ陦ｨ遉ｺ譖ｴ譁ｰ
    const tabs = ['business', 'tools', 'posts'];
    const tabLabels = {
      'business': '嶋 Business',
      'tools': '肌 Tools', 
      'posts': '町 Posts'
    };
    
    tabs.forEach(tabName => {
      const panel = document.querySelector(`[data-category="${tabName}"]`);
      const count = panel ? panel.querySelectorAll('.enhanced-card').length : 0;
      const button = document.querySelector(`[data-tab="${tabName}"]`);
      if (button) {
        button.textContent = `${tabLabels[tabName]} (${count})`;
      }
    });
  }
  
  setupFilters() {
    // 讀懃ｴ｢繝輔ぅ繝ｫ繧ｿ繝ｼ
    document.getElementById('searchInput').addEventListener('input', () => {
      this.applyFilters();
    });
    
    // 驥崎ｦ∝ｺｦ繝輔ぅ繝ｫ繧ｿ繝ｼ
    document.getElementById('importanceFilter').addEventListener('change', () => {
      this.applyFilters();
    });
    
    // 繧ｽ繝ｼ繝・    document.getElementById('sortBy').addEventListener('change', () => {
      this.applySorting();
    });
  }
  
  applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const importance = document.getElementById('importanceFilter').value;
    
    // 迴ｾ蝨ｨ繧｢繧ｯ繝・ぅ繝悶↑繧ｿ繝悶・繧ｫ繝ｼ繝峨・縺ｿ蜃ｦ逅・    const activePanel = document.querySelector(`[data-category="${this.activeTab}"]`);
    const cards = activePanel.querySelectorAll('.enhanced-card');
    
    cards.forEach(card => {
      let showCard = true;
      
      // 讀懃ｴ｢繝輔ぅ繝ｫ繧ｿ繝ｼ
      if (searchTerm) {
        const title = card.querySelector('.card-title a').textContent.toLowerCase();
        const summary = card.querySelector('.card-summary').textContent.toLowerCase();
        const source = card.querySelector('.card-source').textContent.toLowerCase();
        
        showCard = title.includes(searchTerm) || 
                  summary.includes(searchTerm) || 
                  source.includes(searchTerm);
      }
      
      // 驥崎ｦ∝ｺｦ繝輔ぅ繝ｫ繧ｿ繝ｼ
      if (showCard && importance !== 'all') {
        const score = parseFloat(card.dataset.score);
        if (importance === 'high' && score < 7.0) showCard = false;
        if (importance === 'medium' && (score < 4.0 || score >= 7.0)) showCard = false;
        if (importance === 'low' && score >= 4.0) showCard = false;
      }
      
      card.style.display = showCard ? 'block' : 'none';
    });
  }
  
  applySorting() {
    const sortBy = document.getElementById('sortBy').value;
    const activePanel = document.querySelector(`[data-category="${this.activeTab}"]`);
    const container = activePanel.querySelector('.tab-content');
    const cards = Array.from(container.querySelectorAll('.enhanced-card'));
    
    cards.sort((a, b) => {
      if (sortBy === 'score') {
        return parseFloat(b.dataset.score) - parseFloat(a.dataset.score);
      } else if (sortBy === 'time') {
        const timeA = new Date(a.dataset.time || 0);
        const timeB = new Date(b.dataset.time || 0);
        return timeB - timeA;
      } else if (sortBy === 'source') {
        return a.dataset.source.localeCompare(b.dataset.source);
      }
      return 0;
    });
    
    // DOM蜀肴ｧ狗ｯ・    cards.forEach(card => container.appendChild(card));
    
    // 繝輔ぅ繝ｫ繧ｿ繝ｼ蜀埼←逕ｨ
    this.applyFilters();
  }
}

// 蛻晄悄蛹・document.addEventListener('DOMContentLoaded', () => {
  new TabController();
});
</script>

</body>
</html>
'''
    
    # ナビの件数プレースホルダを実数に置換
    html_template = html_template.replace("{len(all_categories.get('business', []))}", str(len(all_categories.get('business', []))))
    html_template = html_template.replace("{len(all_categories.get('tools', []))}", str(len(all_categories.get('tools', []))))
    html_template = html_template.replace("{len(all_categories.get('posts', []))}", str(len(all_categories.get('posts', []))))
    # Replace nav tab count placeholders with actual counts
    html_template = html_template.replace("{len(all_categories.get('business', []))}", str(len(all_categories.get('business', []))))
    html_template = html_template.replace("{len(all_categories.get('tools', []))}", str(len(all_categories.get('tools', []))))
    html_template = html_template.replace("{len(all_categories.get('posts', []))}", str(len(all_categories.get('posts', []))))
    # 繝輔ぃ繧､繝ｫ蜃ｺ蜉・    output_file = Path('index.html')
    output_file.write_text(html_template, encoding='utf-8')
    
    # CSS逕滓・
    css_content = generate_css()
    css_file = Path('style.css')
    css_file.write_text(css_content, encoding='utf-8')
    print("笨・CSS file generated")
    
    print(f"笨・逕滓・螳御ｺ・ {output_file}")
    print(f"投 邱剰ｨ倅ｺ区焚: {total_items}莉ｶ")
    print(f"醇 鬮伜━蜈亥ｺｦ: {high_priority}莉ｶ")
    print(f"箝・蟷ｳ蝮・せ繧ｳ繧｢: {sum(item['engineer_score'] for items in all_categories.values() for item in items) / total_items:.1f}")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n脂 Daily AI News 逕滓・謌仙粥!")
            print("倹 GitHub Pages 縺ｫ繝・・繝ｭ繧､縺励※縺皮｢ｺ隱阪￥縺縺輔＞")
        else:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n笞・・蜃ｦ逅・′荳ｭ譁ｭ縺輔ｌ縺ｾ縺励◆")
        sys.exit(1)
    except Exception as e:
        print(f"\n笶・繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆: {e}")
        sys.exit(1)
