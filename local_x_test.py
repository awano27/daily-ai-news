#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
X投稿処理のローカルテスト
"""

import requests
import csv
from io import StringIO
import html
import re
from urllib.parse import urlparse
from datetime import datetime, timezone, timedelta

def test_x_posts_processing():
    """X投稿処理をローカルでテスト"""
    print("🧪 X投稿処理ローカルテスト開始...")
    
    # 設定
    X_POSTS_CSV = 'https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0'
    HOURS_LOOKBACK = 24
    
    try:
        # 1. CSVデータ取得
        print("📋 CSVデータ取得中...")
        response = requests.get(X_POSTS_CSV, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        csv_content = response.text.strip()
        
        print(f"✅ CSVデータ取得成功: {len(csv_content)} 文字")
        print(f"📄 最初の200文字:")
        print(csv_content[:200])
        print()
        
        # 2. CSV解析（修正されたロジック）
        lines = csv_content.split('\n')
        print(f"🔍 CSV行数: {len(lines)}")
        print("🔍 最初の3行の詳細:")
        
        for i, line in enumerate(lines[:3]):
            print(f"  行{i+1}: {line}")
        print()
        
        # 3. X投稿処理
        x_posts = []
        for i, line in enumerate(lines):
            try:
                # CSVを手動で解析
                parts = list(csv.reader([line]))[0]
                
                if len(parts) < 3:  # 最低3列必要
                    continue
                
                # CSV形式: [timestamp, username, content, image_url, tweet_url]
                timestamp_str = parts[0].strip()
                username = parts[1].strip().lstrip('@')
                tweet_content = parts[2].strip()
                
                # ツイートURLは4列目または5列目
                tweet_url = ''
                if len(parts) > 4:
                    tweet_url = parts[4].strip()
                elif len(parts) > 3:
                    tweet_url = parts[3].strip()
                
                print(f"🔍 行{i+1} 処理中:")
                print(f"  タイムスタンプ: {timestamp_str}")
                print(f"  ユーザー: @{username}")
                print(f"  内容: {tweet_content[:100]}...")
                print(f"  URL: {tweet_url}")
                
                if not tweet_content or not username:
                    print("  ❌ スキップ: 内容またはユーザー名が空")
                    continue
                
                # 日付チェック（最近24時間以内）
                try:
                    from dateutil import parser
                    post_date = parser.parse(timestamp_str)
                    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=HOURS_LOOKBACK)
                    if post_date.replace(tzinfo=timezone.utc) <= cutoff_time:
                        print(f"  ❌ スキップ: 古い投稿 ({timestamp_str})")
                        continue
                except Exception as date_error:
                    print(f"  ⚠️ 日付解析エラー: {date_error}")
                    continue
                
                # テキストクリーニング
                cleaned = re.sub(r"https?://\S+", "", tweet_content)
                cleaned = re.sub(r"\s+", " ", cleaned).strip()
                
                # 外部URLを抽出
                ext_urls = re.findall(r"https?://\S+", tweet_content)
                ext_url = None
                for url in ext_urls:
                    try:
                        host = urlparse(url).netloc.lower()
                        if not any(x in host for x in ["x.com", "twitter.com", "t.co"]):
                            ext_url = url
                            break
                    except:
                        continue
                
                # ツイートURL自体を使用（他に適切なURLがない場合）
                if not ext_url and tweet_url:
                    if 'twitter.com' not in tweet_url and 'x.com' not in tweet_url:
                        ext_url = tweet_url
                
                # タイトル生成
                title = f"🐦 @{username}: {cleaned[:80]}..." if len(cleaned) > 80 else f"🐦 @{username}: {cleaned}"
                
                # 要約生成
                summary = cleaned[:200] + '...' if len(cleaned) > 200 else cleaned
                
                x_posts.append({
                    'title': title,
                    'url': ext_url or tweet_url or '',
                    'summary': summary,
                    'published': timestamp_str,
                    'source': f'X @{username}',
                    'engineer_score': 10.0  # 最高スコア
                })
                
                print(f"  ✅ 処理成功: スコア 10.0")
                print()
                
                if len(x_posts) >= 5:  # テスト用に5件まで
                    break
                    
            except Exception as e:
                print(f"  ❌ 行{i+1}処理エラー: {e}")
                print()
                continue
        
        print(f"📊 X投稿処理結果: {len(x_posts)}件")
        
        # 4. 結果表示
        if x_posts:
            print("\n🎯 取得されたX投稿:")
            for i, post in enumerate(x_posts):
                print(f"\n投稿 {i+1}:")
                print(f"  タイトル: {post['title']}")
                print(f"  URL: {post['url']}")
                print(f"  要約: {post['summary'][:100]}...")
                print(f"  ソース: {post['source']}")
                print(f"  日時: {post['published']}")
                print(f"  スコア: {post['engineer_score']}")
            
            # 5. 簡単なHTMLテスト生成
            html_test = generate_test_html(x_posts)
            with open('test_x_posts.html', 'w', encoding='utf-8') as f:
                f.write(html_test)
            
            print(f"\n✅ テスト成功！")
            print(f"📄 test_x_posts.html を生成しました")
            print(f"🐦 {len(x_posts)}件のX投稿を正常に処理")
            return True
        else:
            print("\n❌ X投稿が取得できませんでした")
            return False
            
    except Exception as e:
        print(f"❌ テストエラー: {e}")
        import traceback
        traceback.print_exc()
        return False

def generate_test_html(x_posts):
    """テスト用HTML生成"""
    now = datetime.now().strftime('%Y-%m-%d %H:%M')
    
    html_content = f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8"/>
  <title>X投稿テスト - {now}</title>
  <style>
    body {{ font-family: system-ui, sans-serif; margin: 20px; background: #f8fafc; }}
    .container {{ max-width: 800px; margin: 0 auto; }}
    .header {{ text-align: center; margin-bottom: 30px; }}
    .post {{ background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }}
    .post-title {{ font-weight: bold; margin-bottom: 8px; color: #1e40af; }}
    .post-meta {{ color: #64748b; font-size: 14px; margin-bottom: 8px; }}
    .post-summary {{ line-height: 1.5; margin-bottom: 8px; }}
    .post-score {{ color: #15803d; font-size: 12px; }}
    a {{ text-decoration: none; color: inherit; }}
    a:hover {{ text-decoration: underline; }}
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>🧪 X投稿処理テスト</h1>
      <p>生成日時: {now}</p>
      <p>取得件数: {len(x_posts)}件</p>
    </header>
    
    <main>
'''
    
    for i, post in enumerate(x_posts):
        html_content += f'''
      <article class="post">
        <div class="post-title">
          <a href="{post['url']}" target="_blank">{html.escape(post['title'])}</a>
        </div>
        <div class="post-meta">
          {post['source']} · {post['published']}
        </div>
        <div class="post-summary">
          {html.escape(post['summary'])}
        </div>
        <div class="post-score">
          有用度スコア: {post['engineer_score']:.1f}
        </div>
      </article>
'''
    
    html_content += '''
    </main>
  </div>
</body>
</html>
'''
    
    return html_content

if __name__ == "__main__":
    print("🚀 X投稿処理ローカルテスト")
    print("=" * 50)
    
    success = test_x_posts_processing()
    
    if success:
        print("\n🎉 ローカルテスト完了！")
        print("📁 test_x_posts.html ファイルを確認してください")
        print("💡 この処理がGitHub Actionsでも正常に動作するはずです")
    else:
        print("\n💥 ローカルテストに問題があります")
        print("🔧 CSV URLやデータ形式を確認してください")