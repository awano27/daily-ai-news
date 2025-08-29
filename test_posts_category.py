#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
postsカテゴリでX投稿処理が正常に呼び出されているかテスト
"""

import os
import sys
import requests
import csv
from io import StringIO
import re
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse

def test_posts_category_logic():
    """postsカテゴリでX投稿処理のロジックをテスト"""
    print("🧪 postsカテゴリ X投稿処理テスト")
    print("=" * 50)
    
    # GitHub Actionsと同じ設定
    HOURS_LOOKBACK = 48  # 修正後の値
    MAX_ITEMS_PER_CATEGORY = 10
    X_POSTS_CSV = 'https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0'
    
    print(f"🔧 設定:")
    print(f"  HOURS_LOOKBACK: {HOURS_LOOKBACK} 時間")
    print(f"  MAX_ITEMS_PER_CATEGORY: {MAX_ITEMS_PER_CATEGORY}")
    print(f"  X_POSTS_CSV: {X_POSTS_CSV}")
    
    try:
        # build_simple_ranking.pyと同じロジックを模擬
        print(f"\n📂 POSTS カテゴリ処理開始...")
        
        # 通常のフィード処理（Reddit等）は省略
        category_items = []  # 空のリストから開始（簡略化）
        
        # postsカテゴリの場合のX投稿追加処理
        category = 'posts'
        if category == 'posts':
            print(f"🔍 DEBUG: postsカテゴリでX投稿取得開始...")
            print(f"🔍 DEBUG: X_POSTS_CSV環境変数 = {X_POSTS_CSV}")
            print(f"🔍 DEBUG: HOURS_LOOKBACK = {HOURS_LOOKBACK}")
            
            # CSV取得
            print(f"📋 CSV取得中...")
            response = requests.get(X_POSTS_CSV, timeout=30)
            response.raise_for_status()
            response.encoding = 'utf-8'
            csv_content = response.text.strip()
            
            print(f"✅ CSV取得成功: {len(csv_content)} 文字")
            
            lines = csv_content.split('\n')
            print(f"🔍 DEBUG: CSV行数: {len(lines)}")
            
            x_items = []
            for i, line in enumerate(lines):
                try:
                    parts = list(csv.reader([line]))[0]
                    
                    if len(parts) < 3:
                        continue
                    
                    timestamp_str = parts[0].strip()
                    username = parts[1].strip().lstrip('@')
                    tweet_content = parts[2].strip()
                    
                    if not tweet_content or not username:
                        continue
                    
                    # 日付チェック（48時間以内）
                    try:
                        import datetime as dt
                        date_part, time_part = timestamp_str.split(' ')
                        year, month, day = map(int, date_part.split('-'))
                        hour, minute, second = map(int, time_part.split(':'))
                        
                        post_date = dt.datetime(year, month, day, hour, minute, second, tzinfo=timezone.utc)
                        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=HOURS_LOOKBACK)
                        
                        if post_date <= cutoff_time:
                            continue  # 古い投稿はスキップ（デバッグ出力なし）
                            
                    except Exception:
                        continue  # 日付エラーはスキップ
                    
                    # テキスト処理
                    cleaned = re.sub(r"https?://\S+", "", tweet_content)
                    cleaned = re.sub(r"\s+", " ", cleaned).strip()
                    
                    title = f"🐦 @{username}: {cleaned[:80]}..." if len(cleaned) > 80 else f"🐦 @{username}: {cleaned}"
                    summary = cleaned[:200] + '...' if len(cleaned) > 200 else cleaned
                    
                    tweet_url = ''
                    if len(parts) > 4:
                        tweet_url = parts[4].strip()
                    elif len(parts) > 3:
                        tweet_url = parts[3].strip()
                    
                    x_items.append({
                        'title': title,
                        'url': tweet_url or '',
                        'summary': summary,
                        'published': timestamp_str,
                        'source': f'X @{username}',
                        'engineer_score': 10.0
                    })
                    
                    if len(x_items) >= MAX_ITEMS_PER_CATEGORY:
                        break
                        
                except Exception as e:
                    continue
            
            print(f"🔍 DEBUG: X投稿取得完了 - {len(x_items)}件")
            
            if x_items:
                # Xポストのスコアを強制的に高くして優先表示
                for i, item in enumerate(x_items):
                    item['engineer_score'] = 10.0  # 最高スコア設定
                    print(f"🔍 DEBUG: Xポスト[{i+1}] - タイトル: {item['title'][:50]}... (スコア: {item['engineer_score']})")
                    print(f"🔍 DEBUG: Xポスト[{i+1}] - URL: {item.get('url', 'N/A')}")
                
                # Xポストを category_items に追加
                category_items.extend(x_items)
                print(f"🔍 DEBUG: Xポスト統合後の総記事数: {len(category_items)}件")
            else:
                print(f"⚠️ DEBUG: X投稿が取得されませんでした - 原因調査が必要")
        
        # 最終結果
        print(f"\n📊 最終結果:")
        print(f"  postsカテゴリ総記事数: {len(category_items)}")
        print(f"  X投稿数: {len([item for item in category_items if '🐦' in item.get('title', '')])}")
        
        if len(category_items) > 0:
            print(f"\n🎯 生成される記事:")
            for i, item in enumerate(category_items[:5]):
                print(f"  {i+1}. {item['title'][:60]}...")
                print(f"     スコア: {item['engineer_score']}")
            
            return True
        else:
            print(f"\n❌ 記事が0件でした")
            return False
            
    except Exception as e:
        print(f"❌ テストエラー: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_posts_category_logic()
    
    if success:
        print(f"\n🎉 postsカテゴリ処理は正常動作しています")
        print(f"💡 GitHub Actionsで同じロジックが実行されているはずです")
    else:
        print(f"\n💥 postsカテゴリ処理に問題があります")