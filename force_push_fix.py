#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修正をGitHubに強制プッシュしてActionsを再実行
"""

import subprocess
import os
from datetime import datetime, timezone, timedelta

def force_push_and_trigger():
    """修正を強制プッシュしてGitHub Actionsを再実行"""
    print("🚀 X投稿修正の強制プッシュと再実行...")
    
    try:
        work_dir = r'C:\Users\yoshitaka\daily-ai-news'
        
        # 1. 現在のGit状態確認
        print("📋 Git状態確認...")
        status_result = subprocess.run(['git', 'status', '--porcelain'], 
                                     cwd=work_dir, capture_output=True, text=True)
        
        if status_result.stdout.strip():
            print("📝 未コミットの変更:")
            print(status_result.stdout)
        else:
            print("✅ すべての変更がコミット済み")
        
        # 2. すべての変更を追加
        print("\n📁 すべてのファイルを追加中...")
        subprocess.run(['git', 'add', '.'], cwd=work_dir, check=True)
        
        # 3. コミット
        timestamp = datetime.now(timezone(timedelta(hours=9))).strftime('%Y-%m-%d %H:%M JST')
        commit_msg = f"fix: X投稿表示修正 - CSV処理完全改善 {timestamp}"
        
        print(f"💾 コミット中: {commit_msg}")
        commit_result = subprocess.run(['git', 'commit', '-m', commit_msg], 
                                     cwd=work_dir, capture_output=True, text=True)
        
        if commit_result.returncode == 0:
            print("✅ コミット成功")
        else:
            if "nothing to commit" in commit_result.stdout:
                print("ℹ️ コミットする変更がありません")
            else:
                print(f"⚠️ コミット結果: {commit_result.stdout}")
        
        # 4. プッシュ
        print("\n📤 GitHub にプッシュ中...")
        push_result = subprocess.run(['git', 'push', 'origin', 'main'], 
                                   cwd=work_dir, capture_output=True, text=True)
        
        if push_result.returncode == 0:
            print("✅ プッシュ成功")
            
            # 5. GitHub Actions再実行
            print("\n🔄 GitHub Actions再実行中...")
            workflow_result = subprocess.run([
                'gh', 'workflow', 'run', 'enhanced-daily-build.yml',
                '--field', 'max_posts=15',
                '--field', 'hours_lookback=48'
            ], cwd=work_dir, capture_output=True, text=True)
            
            if workflow_result.returncode == 0:
                print("✅ GitHub Actions実行開始")
                print("⏰ 約10分後に結果を確認してください")
                print("🌐 https://awano27.github.io/daily-ai-news-pages/")
                return True
            else:
                print(f"❌ GitHub Actions実行失敗: {workflow_result.stderr}")
                return False
        else:
            print(f"❌ プッシュ失敗: {push_result.stderr}")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Git操作エラー: {e}")
        return False
    except Exception as e:
        print(f"❌ 予期しないエラー: {e}")
        return False

def test_csv_directly():
    """CSV処理を直接テスト"""
    print("\n🧪 CSV処理直接テスト...")
    
    try:
        import requests
        import csv
        from io import StringIO
        
        csv_url = "https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0"
        
        response = requests.get(csv_url, timeout=30)
        csv_content = response.text.strip()
        
        print(f"📊 CSV取得: {len(csv_content)} 文字")
        
        lines = csv_content.split('\n')
        print(f"📋 行数: {len(lines)}")
        
        valid_posts = 0
        for i, line in enumerate(lines[:5]):
            try:
                parts = list(csv.reader([line]))[0]
                if len(parts) >= 3:
                    timestamp_str = parts[0].strip()
                    username = parts[1].strip().lstrip('@')
                    tweet_content = parts[2].strip()
                    
                    if username and tweet_content:
                        valid_posts += 1
                        print(f"  ✅ 行{i+1}: @{username} - {tweet_content[:50]}...")
            except Exception as e:
                print(f"  ⚠️ 行{i+1}エラー: {e}")
        
        print(f"📈 有効なX投稿: {valid_posts}件")
        return valid_posts > 0
        
    except Exception as e:
        print(f"❌ CSVテストエラー: {e}")
        return False

def main():
    """メイン処理"""
    print("🎯 X投稿修正 - 強制プッシュ & 再実行")
    print("=" * 60)
    
    # 1. CSV処理テスト
    csv_ok = test_csv_directly()
    
    if csv_ok:
        # 2. 強制プッシュと再実行
        success = force_push_and_trigger()
        
        if success:
            print("\n🎉 修正の強制プッシュ & 再実行完了！")
            print("📱 10分後にサイトでX投稿を確認してください")
        else:
            print("\n💥 プッシュまたは再実行に失敗")
    else:
        print("\n❌ CSV処理に問題があります")
        print("💡 Google SheetsのURLとアクセス権限を確認してください")

if __name__ == "__main__":
    main()