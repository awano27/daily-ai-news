#!/usr/bin/env python3
"""
元サイトスタイル準拠ダッシュボード - 情報収集元拡張版
"""

import json
import os
import requests
import google.generativeai as genai
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse
import time

# Gemini API設定
try:
    gemini_key = os.environ.get('GEMINI_API_KEY')
    if not gemini_key:
        with open('.env', 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('GEMINI_API_KEY='):
                    gemini_key = line.split('=', 1)[1].strip()
                    break
    
    if gemini_key:
        genai.configure(api_key=gemini_key)
model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')
        print("ログ: Gemini API設定完了")
    else:
        model = None
        print("ログ: Gemini APIキーが見つかりません")
except Exception as e:
    model = None
    print(f"ログ: Gemini API設定エラー: {e}")

def fetch_x_posts_from_sheets():
    """Google SheetsからX投稿データを取得"""
    sheet_url = os.environ.get('X_POSTS_CSV', 
        'https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0')
    
    try:
        print(f"ログ: Google Sheetsアクセス中...")
        response = requests.get(sheet_url, timeout=15)
        response.raise_for_status()
        
        lines = response.text.strip().split('\n')
        posts = []
        
        for i, line in enumerate(lines[1:]):  # ヘッダー行をスキップ
            try:
                if '","' in line:
                    parts = [part.strip('"') for part in line.split('","')]
                else:
                    parts = [part.strip('"') for part in line.split(',')]
                
                if len(parts) >= 2 and parts[1].strip():
                    posts.append({
                        'content': parts[1].strip(),
                        'author': parts[0].strip() if parts[0] else f"user_{i}",
                        'timestamp': datetime.now(timezone.utc) - timedelta(hours=i),
                        'url': f"https://x.com/{parts[0].strip()}/status/example_{i}"
                    })
                    if len(posts) >= 20:
                        break
            except:
                continue
        
        print(f"ログ: X投稿取得完了: {len(posts)}件")
        return posts
        
    except Exception as e:
        print(f"ログ: Google Sheets取得エラー: {e}")
        return []

def validate_and_categorize_source(url, title, summary):
    """ソースを検証しカテゴライズ"""
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return False, None
        
        domain = parsed.netloc.lower()
        
        # カテゴリー別の信頼できるドメイン
        categories = {
            'Business': [
                'techcrunch.com', 'bloomberg.com', 'reuters.com', 'wsj.com', 'ft.com',
                'forbes.com', 'cnn.com', 'bbc.com', 'axios.com', 'protocol.com'
            ],
            'Tools': [
                'github.com', 'huggingface.co', 'pytorch.org', 'tensorflow.org',
                'kaggle.com', 'towardsdatascience.com', 'medium.com'
            ],
            'Posts': [
                'arxiv.org', 'nature.com', 'science.org', 'mit.edu', 'stanford.edu',
                'berkeley.edu', 'papers.nips.cc', 'jmlr.org', 'icml.cc', 'iclr.cc'
            ]
        }
        
        for category, domains in categories.items():
            if any(trusted_domain in domain for trusted_domain in domains):
                return True, category
        
        # 企業公式ブログ
        if any(x in domain for x in ['microsoft.com', 'google.com', 'openai.com', 'anthropic.com']):
            return True, 'Business'
        
        return False, None
        
    except Exception as e:
        return False, None

def extract_articles_from_analysis():
    """既存の分析データから記事を抽出"""
    try:
        analysis_file = 'comprehensive_analysis_20250818_101345.json'
        if not os.path.exists(analysis_file):
            print(f"ログ: 分析ファイル {analysis_file} が見つかりません")
            return []
        
        with open(analysis_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        articles = []
        categories = ['ai_breaking_news', 'business_insights', 'developer_tools', 'research_papers']
        
        for category in categories:
            if category in data:
                for item in data[category][:10]:  # 各カテゴリから10件
                    basic = item.get('basic', {})
                    if not basic.get('success'):
                        continue
                    
                    # 記事URLを抽出
                    links = basic.get('links', [])
                    article_url = basic.get('url', '')
                    
                    # より具体的な記事URLを探す
                    for link in links:
                        link_url = link.get('url', '')
                        if (link_url and link_url != article_url and 
                            '2025' in link_url and len(link.get('text', '')) > 10):
                            article_url = link_url
                            break
                    
                    title = basic.get('title', '').split(' | ')[0]
                    content = basic.get('content', '')
                    
                    # AIで要約を生成
                    try:
                        if model:
                            summary_prompt = f"""
以下の記事内容を日本語で簡潔に要約してください（1行、60文字以内）：

タイトル: {title}
内容: {content[:300]}...

ビジネスインパクトを中心に要約してください。
"""
                            summary_response = model.generate_content(summary_prompt)
                            summary = summary_response.text.strip()
                        else:
                            summary = f"{urlparse(article_url).netloc}からのAI関連ニュース"
                    except:
                        summary = "AI技術に関する最新情報"
                    
                    articles.append({
                        'title': title,
                        'summary': summary,
                        'url': article_url,
                        'domain': urlparse(article_url).netloc,
                        'category': category
                    })
        
        return articles
        
    except Exception as e:
        print(f"ログ: 記事抽出エラー: {e}")
        return []

def create_original_style_dashboard():
    """元サイトスタイルのダッシュボードを作成"""
    print("ログ: 元サイトスタイルダッシュボード生成開始")
    
    # データ取得
    articles = extract_articles_from_analysis()
    x_posts = fetch_x_posts_from_sheets()
    
    # 記事を検証・分類
    categorized_articles = {
        'Business': [],
        'Tools': [],
        'Posts': []
    }
    
    valid_articles = []
    for article in articles:
        is_valid, category = validate_and_categorize_source(
            article['url'], article['title'], article['summary']
        )
        if is_valid and category:
            categorized_articles[category].append(article)
            valid_articles.append(article)
            print(f"ログ: 記事追加 [{category}]: {article['title'][:50]}...")
    
    # 統計計算
    total_articles = len(valid_articles)
    total_sources = len(set(article['domain'] for article in valid_articles))
    total_posts = len(x_posts)
    
    # HTML生成
    current_time = datetime.now(timezone(timedelta(hours=9)))
    timestamp = current_time.strftime('%Y-%m-%d')
    update_time = current_time.strftime('%Y-%m-%d | 最終更新: %H:%M JST')
    
    html_content = f'''<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI業界全体像ダッシュボード - {timestamp}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f7f9fc;
            color: #333;
            margin: 0;
        }}
        .container {{
            max-width: 1200px;
            margin: auto;
            padding: 20px;
        }}
        .header {{ 
            text-align: center;
            margin-bottom: 40px;
        }}
        .header h1 {{ font-size: 2rem; margin: 0; color: #1f2937; }}
        .header .subtitle {{ color: #6b7280; margin-top: 8px; font-size: 0.9rem; }}
        .header .update-time {{ color: #6b7280; margin-top: 8px; font-size: 0.9rem; }}
        
        /* サマリーセクション */
        .summary {{
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            margin-bottom: 40px;
        }}
        .summary h2 {{
            font-size: 1.4rem;
            margin-bottom: 15px;
            color: #111827;
            border-left: 4px solid #3b82f6;
            padding-left: 8px;
        }}
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }}
        .kpi {{
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }}
        .kpi-number {{
            font-size: 1.8rem;
            font-weight: bold;
            color: #3b82f6;
        }}
        .kpi-label {{
            font-size: 0.85rem;
            color: #6b7280;
            margin-top: 4px;
        }}
        
        /* カテゴリカード */
        .categories-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .category-card {{
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            overflow: hidden;
        }}
        .category-header {{
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .category-title {{
            font-size: 1.1rem;
            font-weight: 600;
        }}
        .category-count {{
            font-size: 0.8rem;
            opacity: 0.9;
        }}
        .category-content {{
            padding: 20px;
        }}
        .article-item {{
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
        }}
        .article-item:last-child {{
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }}
        .article-title {{
            font-size: 0.95rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
        }}
        .article-title a {{
            color: #1f2937;
            text-decoration: none;
        }}
        .article-title a:hover {{
            color: #3b82f6;
        }}
        .article-summary {{
            font-size: 0.85rem;
            color: #6b7280;
            margin-bottom: 8px;
        }}
        .article-meta {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.8rem;
        }}
        .article-source {{
            color: #9ca3af;
        }}
        .article-link {{
            background: #f3f4f6;
            color: #6b7280;
            padding: 2px 8px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 0.75rem;
        }}
        .article-link:hover {{
            background: #3b82f6;
            color: white;
        }}
        
        /* SNSセクション */
        .sns-section {{
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            margin-bottom: 30px;
        }}
        .sns-section h3 {{
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: #1f2937;
            border-left: 4px solid #3b82f6;
            padding-left: 8px;
        }}
        .sns-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
        }}
        .sns-item {{
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid #3b82f6;
        }}
        .sns-content {{
            font-size: 0.9rem;
            color: #374151;
            margin-bottom: 8px;
        }}
        .sns-meta {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.8rem;
            color: #6b7280;
        }}
        .sns-author {{
            font-weight: 600;
        }}
        
        .footer {{ 
            text-align: center; 
            padding: 20px; 
            color: #64748b; 
            border-top: 1px solid #e2e8f0; 
            font-size: 0.9rem;
        }}
        
        @media (max-width: 768px) {{
            .header h1 {{ font-size: 1.8rem; }}
            .container {{ padding: 15px; }}
            .kpi-grid {{ grid-template-columns: repeat(2, 1fr); }}
            .categories-grid {{ grid-template-columns: 1fr; }}
            .sns-grid {{ grid-template-columns: 1fr; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>AI業界全体像ダッシュボード</h1>
            <p class="subtitle">今日のAI業界: {total_articles}件のニュース分析</p>
            <p class="update-time">{update_time}</p>
        </header>
        
        <!-- エグゼクティブサマリー -->
        <section class="summary">
            <h2>エグゼクティブサマリー</h2>
            <p>今日のAI業界: {total_articles}件のニュース分析</p>
            <div class="kpi-grid">
                <div class="kpi">
                    <div class="kpi-number">{total_articles}</div>
                    <div class="kpi-label">総ニュース数</div>
                </div>
                <div class="kpi">
                    <div class="kpi-number">{len(categorized_articles['Business'])}</div>
                    <div class="kpi-label">ビジネス記事</div>
                </div>
                <div class="kpi">
                    <div class="kpi-number">{total_sources}</div>
                    <div class="kpi-label">情報ソース数</div>
                </div>
                <div class="kpi">
                    <div class="kpi-number">{total_posts}</div>
                    <div class="kpi-label">SNS投稿数</div>
                </div>
            </div>
        </section>
        
        <!-- カテゴリ別ニュース -->
        <div class="categories-grid">'''
    
    # カテゴリ別記事
    category_names = {
        'Business': 'ビジネス・企業動向',
        'Tools': '開発ツール・プラットフォーム',
        'Posts': '研究・論文・技術解説'
    }
    
    for category, display_name in category_names.items():
        articles = categorized_articles[category][:8]  # 最大8件
        html_content += f'''
            <div class="category-card">
                <div class="category-header">
                    <div class="category-title">{display_name}</div>
                    <div class="category-count">{len(articles)}件</div>
                </div>
                <div class="category-content">'''
        
        for article in articles:
            html_content += f'''
                    <div class="article-item">
                        <div class="article-title">
                            <a href="{article['url']}" target="_blank">{article['title']}</a>
                        </div>
                        <div class="article-summary">{article['summary']}</div>
                        <div class="article-meta">
                            <span class="article-source">{article['domain']}</span>
                            <a href="{article['url']}" target="_blank" class="article-link">詳細</a>
                        </div>
                    </div>'''
        
        html_content += '''
                </div>
            </div>'''
    
    # SNSセクション
    html_content += f'''
        </div>
        
        <!-- SNS投稿 -->
        <section class="sns-section">
            <h3>注目のSNS投稿</h3>
            <div class="sns-grid">'''
    
    for post in x_posts[:9]:  # 最大9件
        jst_time = post['timestamp'].astimezone(timezone(timedelta(hours=9)))
        formatted_time = jst_time.strftime('%H:%M')
        
        html_content += f'''
                <div class="sns-item">
                    <div class="sns-content">{post['content']}</div>
                    <div class="sns-meta">
                        <span class="sns-author">@{post['author']}</span>
                        <span>{formatted_time}</span>
                    </div>
                </div>'''
    
    html_content += f'''
            </div>
        </section>
        
        <footer class="footer">
            <p>AI業界全体像ダッシュボード | データ更新: {update_time}</p>
            <p>掲載記事: {total_articles}件 | 情報ソース: {total_sources}サイト | SNS投稿: {total_posts}件</p>
        </footer>
    </div>
</body>
</html>'''
    
    return html_content, total_articles, total_posts

def main():
    """メイン処理"""
    try:
        html_content, articles_count, posts_count = create_original_style_dashboard()
        
        current_time = datetime.now(timezone(timedelta(hours=9)))
        filename = f"original_style_dashboard_{current_time.strftime('%Y%m%d_%H%M%S')}.html"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ 元サイトスタイルダッシュボード生成完了: {filename}")
        print(f"📊 掲載記事: {articles_count}件")
        print(f"📱 SNS投稿: {posts_count}件")
        
        return True
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

if __name__ == "__main__":
    main()
