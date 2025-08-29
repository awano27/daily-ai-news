#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
手動でX投稿処理をテストしてGitHub Actionsと同じ条件で実行
"""

import os
import sys
import requests
import csv
from io import StringIO
import re
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse

def manual_test_exact_conditions():
    """GitHub Actionsと同じ条件でテスト"""
    print("🧪 GitHub Actions同等条件でのテスト")
    print("=" * 50)
    
    # GitHub Actionsと同じ環境変数設定
    os.environ['TRANSLATE_TO_JA'] = '1'
    os.environ['TRANSLATE_ENGINE'] = 'google'
    os.environ['HOURS_LOOKBACK'] = '24'  # GitHub Actionsのデフォルト
    os.environ['MAX_ITEMS_PER_CATEGORY'] = '10'  # GitHub Actionsのデフォルト
    os.environ['X_POSTS_CSV'] = 'https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0'
    
    HOURS_LOOKBACK = int(os.environ['HOURS_LOOKBACK'])
    MAX_ITEMS_PER_CATEGORY = int(os.environ['MAX_ITEMS_PER_CATEGORY'])
    X_POSTS_CSV = os.environ['X_POSTS_CSV']
    
    print(f"🔧 設定:")
    print(f"  HOURS_LOOKBACK: {HOURS_LOOKBACK}")
    print(f"  MAX_ITEMS_PER_CATEGORY: {MAX_ITEMS_PER_CATEGORY}")
    print(f"  X_POSTS_CSV: {X_POSTS_CSV}")
    
    try:
        # 1. CSV取得
        print(f"\n📋 CSV取得中...")
        response = requests.get(X_POSTS_CSV, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        csv_content = response.text.strip()
        
        print(f"✅ CSV取得成功: {len(csv_content)} 文字")
        
        # 2. CSV処理（GitHub Actionsと同じロジック）
        lines = csv_content.split('\n')
        print(f"📊 CSV行数: {len(lines)}")
        
        posts = []
        for i, line in enumerate(lines):
            try:
                parts = list(csv.reader([line]))[0]
                
                if len(parts) < 3:
                    continue
                
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
                
                # 日付チェック（GitHub Actionsと同じ条件）
                try:
                    # 簡単な日付解析（dateutilを使わない版）
                    import datetime as dt
                    
                    # 2025-08-27 3:31:33 形式を解析
                    date_part, time_part = timestamp_str.split(' ')
                    year, month, day = map(int, date_part.split('-'))
                    hour, minute, second = map(int, time_part.split(':'))
                    
                    post_date = dt.datetime(year, month, day, hour, minute, second, tzinfo=timezone.utc)
                    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=HOURS_LOOKBACK)
                    
                    if post_date <= cutoff_time:
                        print(f"  ❌ 古い投稿をスキップ: {timestamp_str}")
                        continue
                    else:
                        print(f"  ✅ 新しい投稿: {timestamp_str} (@{username})")
                        
                except Exception as date_error:
                    print(f"  ⚠️ 日付解析エラー: {timestamp_str} - {date_error}")
                    # 日付エラーでも投稿を含める（GitHub Actionsの動作を模倣）
                    continue
                
                # テキスト処理
                cleaned = re.sub(r"https?://\S+", "", tweet_content)
                cleaned = re.sub(r"\s+", " ", cleaned).strip()
                
                title = f"🐦 @{username}: {cleaned[:80]}..." if len(cleaned) > 80 else f"🐦 @{username}: {cleaned}"
                summary = cleaned[:200] + '...' if len(cleaned) > 200 else cleaned
                
                posts.append({
                    'title': title,
                    'url': tweet_url or '',
                    'summary': summary,
                    'published': timestamp_str,
                    'source': f'X @{username}',
                    'engineer_score': 10.0
                })
                
                print(f"  ✅ 処理成功: @{username} - スコア: 10.0")
                
                if len(posts) >= MAX_ITEMS_PER_CATEGORY:
                    print(f"  🚫 上限到達: {MAX_ITEMS_PER_CATEGORY}件")
                    break
                    
            except Exception as e:
                print(f"  ❌ 行{i+1}エラー: {e}")
                continue
        
        print(f"\n📊 最終結果:")
        print(f"  処理済みX投稿: {len(posts)}件")
        print(f"  上限設定: {MAX_ITEMS_PER_CATEGORY}件")
        print(f"  時間範囲: 過去{HOURS_LOOKBACK}時間")
        
        if posts:
            print(f"\n🐦 取得されたX投稿:")
            for i, post in enumerate(posts):
                print(f"  {i+1}. {post['title'][:60]}...")
                print(f"     ソース: {post['source']}")
                print(f"     日時: {post['published']}")
            
            return True
        else:
            print(f"\n❌ X投稿が0件でした")
            print(f"💡 原因分析:")
            print(f"  - CSV行数: {len(lines)}行")
            print(f"  - 時間フィルタ: 過去{HOURS_LOOKBACK}時間以内")
            print(f"  - 上限設定: {MAX_ITEMS_PER_CATEGORY}件")
            
            return False
            
    except Exception as e:
        print(f"❌ テストエラー: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = manual_test_exact_conditions()
    
    if success:
        print(f"\n🎉 テスト成功 - X投稿が処理されました")
        print(f"💡 GitHub Actionsでも同様に動作するはずです")
    else:
        print(f"\n💥 テスト失敗 - X投稿が処理されませんでした")
        print(f"🔧 GitHub Actionsでも同じ問題が発生している可能性があります")