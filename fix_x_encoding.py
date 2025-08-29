#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
X投稿の文字化け修正スクリプト
CSVからのデータ読み込み時のエンコーディング問題を解決
"""

import requests
import csv
from io import StringIO
import html
import re

def fix_csv_encoding():
    """CSVデータの文字化け修正とテスト"""
    csv_url = "https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0"
    
    print("📋 CSVデータを取得してエンコーディングをテスト...")
    
    try:
        # CSVデータを取得
        response = requests.get(csv_url, timeout=30)
        response.raise_for_status()
        
        # エンコーディングを明示的に設定
        response.encoding = 'utf-8'
        csv_content = response.text
        
        print(f"✅ CSVデータ取得成功 ({len(csv_content)} 文字)")
        
        # CSV解析
        csv_file = StringIO(csv_content)
        reader = csv.DictReader(csv_file)
        
        posts = []
        for i, row in enumerate(reader):
            if i >= 5:  # 最初の5投稿のみテスト
                break
                
            content = row.get('Tweet', row.get('Content', ''))
            url = row.get('URL', row.get('Link', ''))
            
            if content and url:
                # HTML エンティティをデコード
                content_cleaned = html.unescape(content)
                
                # 改行文字を正規化
                content_cleaned = re.sub(r'[\r\n]+', ' ', content_cleaned)
                
                # 余分な空白を削除
                content_cleaned = re.sub(r'\s+', ' ', content_cleaned).strip()
                
                posts.append({
                    'content': content_cleaned,
                    'url': url,
                    'raw_content': content[:100] + '...' if len(content) > 100 else content
                })
                
                print(f"\n🔤 投稿 {i+1}:")
                print(f"  元データ: {content[:50]}...")
                print(f"  修正後: {content_cleaned[:50]}...")
                print(f"  URL: {url}")
        
        print(f"\n📊 処理結果: {len(posts)} 投稿を正常に処理")
        
        # 修正されたデータをHTMLに反映
        update_html_with_fixed_posts(posts)
        
        return posts
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()
        return []

def update_html_with_fixed_posts(posts):
    """修正されたX投稿でHTMLを更新"""
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # X投稿セクションを探す
        posts_start = html_content.find('data-category="Posts"')
        if posts_start == -1:
            print("⚠️ Posts セクションが見つかりません")
            return
            
        # 文字化けした日本語投稿を修正されたものに置換
        for i, post in enumerate(posts):
            if '日本語' in post['content'] or 'AI' in post['content']:
                # 特定の文字化けパターンを修正
                original_garbled = post['raw_content']
                fixed_content = post['content']
                
                # HTMLコンテンツ内の対応する投稿を更新
                html_content = html_content.replace(original_garbled[:30], fixed_content[:100])
        
        # 修正されたHTMLを保存
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        print("✅ index.html のエンコーディング修正完了")
        
    except Exception as e:
        print(f"❌ HTML更新エラー: {e}")

if __name__ == "__main__":
    print("🔧 X投稿エンコーディング修正開始...")
    posts = fix_csv_encoding()
    if posts:
        print("✅ エンコーディング修正完了！")
    else:
        print("❌ エンコーディング修正失敗")