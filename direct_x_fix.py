#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
X投稿問題の直接修正
"""

import requests
import csv
from io import StringIO
import html
import re
from urllib.parse import urlparse
from pathlib import Path
import json
from datetime import datetime, timezone, timedelta

def main():
    """X投稿の修正を直接実行"""
    print("🚀 X投稿直接修正開始...")
    
    # 環境設定
    X_POSTS_CSV = 'https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0'
    HOURS_LOOKBACK = 24
    MAX_ITEMS_PER_CATEGORY = 25
    
    try:
        # 1. CSVデータ取得
        print("📋 CSVデータ取得中...")
        response = requests.get(X_POSTS_CSV, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        csv_content = response.text.strip()
        
        print(f"✅ CSVデータ取得成功: {len(csv_content)} 文字")
        print(f"📄 最初の200文字: {csv_content[:200]}")
        
        # 2. CSV解析
        lines = csv_content.split('\n')
        print(f"🔍 CSV行数: {len(lines)}")
        
        x_posts = []
        for i, line in enumerate(lines):
            try:
                parts = list(csv.reader([line]))[0]
                
                if len(parts) < 3:
                    continue
                
                # CSV形式: [timestamp, username, content, image_url, tweet_url]
                timestamp_str = parts[0].strip()
                username = parts[1].strip().lstrip('@')
                tweet_content = parts[2].strip()
                
                tweet_url = ''
                if len(parts) > 4:
                    tweet_url = parts[4].strip()
                elif len(parts) > 3:
                    tweet_url = parts[3].strip()
                
                if not tweet_content or not username:
                    continue
                
                # 日付チェック（最近24時間以内）
                try:
                    from dateutil import parser
                    post_date = parser.parse(timestamp_str)
                    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=HOURS_LOOKBACK)
                    if post_date.replace(tzinfo=timezone.utc) <= cutoff_time:
                        continue
                except:
                    continue
                
                # テキストクリーニング
                cleaned = re.sub(r"https?://\S+", "", tweet_content)
                cleaned = re.sub(r"\s+", " ", cleaned).strip()
                
                # タイトル生成
                title = f"🐦 @{username}: {cleaned[:80]}..." if len(cleaned) > 80 else f"🐦 @{username}: {cleaned}"
                
                # 要約生成
                summary = cleaned[:200] + '...' if len(cleaned) > 200 else cleaned
                
                x_posts.append({
                    'title': title,
                    'url': tweet_url or '',
                    'summary': summary,
                    'published': timestamp_str,
                    'source': f'X @{username}',
                    'engineer_score': 10.0  # 最高スコア
                })
                
                print(f"✅ X投稿処理: @{username} - {title[:50]}...")
                
                if len(x_posts) >= MAX_ITEMS_PER_CATEGORY:
                    break
                    
            except Exception as e:
                print(f"⚠️ 行{i+1}エラー: {e}")
                continue
        
        print(f"📊 X投稿取得完了: {len(x_posts)}件")
        
        # 3. 簡単なHTML生成（テスト用）
        if x_posts:
            html_content = generate_test_html(x_posts)
            
            # index.htmlに保存
            with open('index.html', 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print("✅ index.html生成完了")
            print(f"📄 サイズ: {len(html_content)} 文字")
            print(f"🐦 X投稿: {len(x_posts)}件を含む")
            
            return True
        else:
            print("❌ X投稿が取得できませんでした")
            return False
            
    except Exception as e:
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()
        return False

def generate_test_html(x_posts):
    """テスト用HTML生成"""
    now = datetime.now(timezone(timedelta(hours=9))).strftime('%Y-%m-%d %H:%M JST')
    
    html_content = f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Daily AI News — {now}</title>
  <style>
    body {{ font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }}
    .container {{ max-width: 800px; margin: 0 auto; }}
    .header {{ text-align: center; margin-bottom: 30px; }}
    .title {{ font-size: 2rem; font-weight: bold; color: #1e40af; }}
    .updated {{ color: #64748b; margin: 10px 0; }}
    .tabs {{ display: flex; border-bottom: 2px solid #e2e8f0; margin: 20px 0; }}
    .tab {{ padding: 10px 20px; background: none; border: none; cursor: pointer; font-size: 16px; }}
    .tab.active {{ border-bottom: 3px solid #1e40af; color: #1e40af; }}
    .content {{ display: grid; gap: 16px; }}
    .card {{ background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }}
    .card-title {{ font-weight: bold; margin-bottom: 8px; }}
    .card-title a {{ text-decoration: none; color: #1e40af; }}
    .card-meta {{ color: #64748b; font-size: 14px; margin-bottom: 8px; }}
    .card-summary {{ line-height: 1.5; }}
    .card-score {{ color: #15803d; font-size: 12px; margin-top: 8px; }}
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">📰 Daily AI News</h1>
      <div class="updated">最終更新：{now}</div>
      <div class="updated">X投稿修正版 - {len(x_posts)}件のX投稿を表示中</div>
    </header>

    <nav class="tabs">
      <button class="tab active" onclick="showTab('posts')">💬 Posts ({len(x_posts)})</button>
    </nav>

    <section id="posts" class="content">
'''
    
    for post in x_posts:
        html_content += f'''
      <article class="card">
        <h3 class="card-title">
          <a href="{post['url']}" target="_blank" rel="noopener">{html.escape(post['title'])}</a>
        </h3>
        <div class="card-meta">
          <span>{post['source']}</span> · <span>{post['published']}</span>
        </div>
        <div class="card-summary">{html.escape(post['summary'])}</div>
        <div class="card-score">有用度: {post['engineer_score']:.1f}</div>
      </article>
'''
    
    html_content += '''
    </section>
  </div>

  <script>
    function showTab(tabName) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
    }
  </script>
</body>
</html>
'''
    
    return html_content

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎉 X投稿直接修正完了！")
        print("📁 index.htmlが生成されました")
    else:
        print("\n💥 修正に失敗しました")