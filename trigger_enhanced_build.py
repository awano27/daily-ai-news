#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced Daily Build GitHub Actionsを手動トリガー
"""

import subprocess
import sys
import os
from datetime import datetime, timezone, timedelta

def trigger_github_actions():
    """GitHub Actionsワークフローを手動トリガー"""
    print("🚀 Enhanced Daily Build GitHub Actions 手動実行中...")
    
    try:
        # 作業ディレクトリを設定
        work_dir = r'C:\Users\yoshitaka\daily-ai-news'
        
        # 1. ワークフロー一覧を確認
        print("📋 利用可能なワークフロー:")
        result = subprocess.run(['gh', 'workflow', 'list'], 
                              cwd=work_dir, capture_output=True, text=True)
        if result.returncode == 0:
            print(result.stdout)
        else:
            print(f"⚠️ ワークフロー一覧取得に問題: {result.stderr}")
        
        # 2. Enhanced Daily Build を実行
        print("\n🔄 Enhanced Daily Build 実行中...")
        result = subprocess.run([
            'gh', 'workflow', 'run', 'enhanced-daily-build.yml',
            '--field', 'max_posts=10',
            '--field', 'hours_lookback=24'
        ], cwd=work_dir, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ GitHub Actions実行開始成功！")
            print("📡 ワークフロー実行中...")
            
            # 3. 実行状況確認
            print("\n🔍 最近の実行状況:")
            status_result = subprocess.run(['gh', 'run', 'list', '--limit', '3'], 
                                         cwd=work_dir, capture_output=True, text=True)
            if status_result.returncode == 0:
                print(status_result.stdout)
            
            return True
        else:
            print(f"❌ GitHub Actions実行失敗: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ GitHub CLI (gh) が見つかりません")
        print("💡 https://cli.github.com/ からインストールしてください")
        return False
    except Exception as e:
        print(f"❌ 予期しないエラー: {e}")
        return False

def alternative_trigger():
    """代替方法：gitを使って手動でトリガー"""
    print("\n🔄 代替方法: git push でトリガー...")
    
    try:
        work_dir = r'C:\Users\yoshitaka\daily-ai-news'
        
        # 現在の時刻でダミーファイル作成
        timestamp = datetime.now(timezone(timedelta(hours=9))).strftime('%Y-%m-%d_%H-%M-%S')
        trigger_file = f"trigger_build_{timestamp}.txt"
        
        with open(os.path.join(work_dir, trigger_file), 'w') as f:
            f.write(f"X投稿修正トリガー - {timestamp}")
        
        # git操作
        subprocess.run(['git', 'add', trigger_file], cwd=work_dir, check=True)
        subprocess.run(['git', 'commit', '-m', f'trigger: X投稿修正版ビルド実行 {timestamp}'], 
                      cwd=work_dir, check=True)
        subprocess.run(['git', 'push', 'origin', 'main'], cwd=work_dir, check=True)
        
        print("✅ git push完了 - GitHub Actionsが自動実行されます")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Git操作エラー: {e}")
        return False
    except Exception as e:
        print(f"❌ 代替方法エラー: {e}")
        return False

def main():
    """メイン処理"""
    print("🎯 X投稿修正 - GitHub Actions手動実行")
    print("=" * 50)
    
    # メイン方法を試行
    success = trigger_github_actions()
    
    if not success:
        print("\n🔄 代替方法を試行...")
        success = alternative_trigger()
    
    if success:
        print("\n🎉 GitHub Actions実行開始！")
        print("📱 処理状況は以下で確認できます:")
        print("   https://github.com/awano27/daily-ai-news-pages/actions")
        print("⏰ 完了まで約5-10分かかります")
        print("🌐 完了後、サイトでX投稿が表示されます")
    else:
        print("\n💥 GitHub Actions実行に失敗しました")
        print("💡 手動でGitHubサイトからActions > Enhanced Daily Build > Run workflowを実行してください")

if __name__ == "__main__":
    main()