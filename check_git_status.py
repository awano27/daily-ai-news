#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gitの状態確認とプッシュ
"""

import subprocess
import sys

def check_and_push():
    """Git状態確認とプッシュ"""
    print("🔍 Git状態確認中...")
    
    try:
        # 1. Git status
        print("\n📋 Git status:")
        result = subprocess.run(['git', 'status', '--porcelain'], 
                              capture_output=True, text=True, 
                              cwd=r'C:\Users\yoshitaka\daily-ai-news')
        
        if result.stdout.strip():
            print("📝 未コミットの変更:")
            print(result.stdout)
            
            # 2. 変更を追加
            print("\n📁 変更をステージング...")
            subprocess.run(['git', 'add', '.'], 
                         cwd=r'C:\Users\yoshitaka\daily-ai-news', check=True)
            
            # 3. コミット
            print("💾 コミット中...")
            commit_msg = "fix: HOURS_LOOKBACKを48時間に変更 - タイムゾーン問題解決"
            subprocess.run(['git', 'commit', '-m', commit_msg], 
                         cwd=r'C:\Users\yoshitaka\daily-ai-news', check=True)
            
            # 4. プッシュ
            print("📤 GitHubにプッシュ中...")
            subprocess.run(['git', 'push', 'origin', 'main'], 
                         cwd=r'C:\Users\yoshitaka\daily-ai-news', check=True)
            
            print("✅ プッシュ完了！")
            return True
        else:
            print("✅ すべての変更はコミット済み")
            
            # 最新のコミットを確認
            result = subprocess.run(['git', 'log', '--oneline', '-n', '5'], 
                                  capture_output=True, text=True, 
                                  cwd=r'C:\Users\yoshitaka\daily-ai-news')
            print("\n📝 最新のコミット:")
            print(result.stdout)
            
            # リモートとの差分確認
            result = subprocess.run(['git', 'status', '-sb'], 
                                  capture_output=True, text=True, 
                                  cwd=r'C:\Users\yoshitaka\daily-ai-news')
            print("\n🔄 ブランチ状態:")
            print(result.stdout)
            
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Gitエラー: {e}")
        return False
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Git状態確認とプッシュ")
    print("=" * 50)
    
    needs_push = check_and_push()
    
    if needs_push:
        print("\n🎉 変更をGitHubにプッシュしました！")
        print("📡 GitHub Actionsを手動実行してください:")
        print("   1. https://github.com/awano27/daily-ai-news-pages/actions")
        print("   2. Enhanced Daily AI News (Full Pipeline) を選択")
        print("   3. Run workflow で hours_lookback=48 を指定")
    else:
        print("\n📊 現在の状態:")
        print("✅ ローカルの変更はすべてGitHubに反映済み")
        print("🔄 GitHub Actionsを手動実行してください:")
        print("   hours_lookback=48 を必ず指定！")