#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSVデータの構造とエンコーディングをデバッグ
"""

import requests
import csv
from io import StringIO

def debug_csv_structure():
    """CSVの構造を詳細に調査"""
    csv_url = "https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0"
    
    try:
        # CSVデータを取得
        response = requests.get(csv_url, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        csv_content = response.text
        
        print("📋 CSVデータの最初の1000文字:")
        print("=" * 50)
        print(csv_content[:1000])
        print("=" * 50)
        
        # CSV解析
        csv_file = StringIO(csv_content)
        reader = csv.DictReader(csv_file)
        
        print("\n📊 CSV列名:")
        if reader.fieldnames:
            for i, field in enumerate(reader.fieldnames):
                print(f"  {i}: '{field}'")
        
        print(f"\n🔍 最初の3行のデータ:")
        for i, row in enumerate(reader):
            if i >= 3:
                break
            print(f"\n行 {i+1}:")
            for key, value in row.items():
                if value and len(value.strip()) > 0:
                    print(f"  {key}: {value[:100]}...")
        
        # 再度読み込んで投稿数をカウント
        csv_file = StringIO(csv_content)
        reader = csv.DictReader(csv_file)
        
        valid_posts = 0
        for row in reader:
            # 可能性のある列名をすべてチェック
            possible_content_fields = ['Tweet', 'Content', 'Text', 'Message', 'Post']
            possible_url_fields = ['URL', 'Link', 'Source', 'Permalink']
            
            content = None
            url = None
            
            for field in possible_content_fields:
                if field in row and row[field] and row[field].strip():
                    content = row[field].strip()
                    break
            
            for field in possible_url_fields:
                if field in row and row[field] and row[field].strip():
                    url = row[field].strip()
                    break
            
            if content and url:
                valid_posts += 1
                if valid_posts <= 3:  # 最初の3投稿を表示
                    print(f"\n✅ 有効投稿 {valid_posts}:")
                    print(f"  内容: {content[:100]}...")
                    print(f"  URL: {url}")
        
        print(f"\n📈 有効投稿総数: {valid_posts}")
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_csv_structure()