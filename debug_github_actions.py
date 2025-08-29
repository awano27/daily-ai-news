#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub Actionsでの実行をデバッグ
"""

import subprocess
import sys
import os

def check_github_actions_log():
    """GitHub Actionsの最新実行ログを確認"""
    print("🔍 GitHub Actions実行ログ確認...")
    
    try:
        work_dir = r'C:\Users\yoshitaka\daily-ai-news'
        
        # 最新実行のログを取得
        print("📋 最新実行の詳細ログを取得中...")
        result = subprocess.run([
            'gh', 'run', 'view', '--log'
        ], cwd=work_dir, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            log_lines = result.stdout.split('\n')
            
            print("🔍 X投稿関連ログを検索中...")
            x_related_logs = []
            
            for line in log_lines:
                if any(keyword in line.lower() for keyword in [
                    'x投稿', 'x posts', 'posts category', 'csv', 
                    'debug', 'fetch_x_posts', '🐦', 'ctgptlb',
                    'twitter', 'posts section', 'posts)'
                ]):
                    x_related_logs.append(line)
            
            if x_related_logs:
                print(f"\n📊 X投稿関連ログ ({len(x_related_logs)}行):")
                for log in x_related_logs[-30:]:  # 最新30行
                    print(f"  {log}")
            else:
                print("\n⚠️ X投稿関連ログが見つかりません")
                print("📄 全ログの重要部分:")
                for line in log_lines[-100:]:  # 最新100行
                    if any(keyword in line.lower() for keyword in ['error', 'fail', 'posts', 'csv']):
                        print(f"  {line}")
            
            return True
        else:
            print(f"❌ ログ取得失敗: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

def force_trigger_with_debug():
    """デバッグ用にGitHub Actionsを再実行"""
    print("\n🚀 デバッグ用GitHub Actions実行中...")
    
    try:
        work_dir = r'C:\Users\yoshitaka\daily-ai-news'
        
        # ワークフローを実行
        result = subprocess.run([
            'gh', 'workflow', 'run', 'enhanced-daily-build.yml',
            '--field', 'max_posts=20',
            '--field', 'hours_lookback=48'
        ], cwd=work_dir, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ GitHub Actions実行開始")
            print("⏰ 10分後にログを確認してください")
            return True
        else:
            print(f"❌ 実行失敗: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

def main():
    """メイン処理"""
    print("🔧 GitHub Actions X投稿デバッグ")
    print("=" * 50)
    
    # 1. 現在のログ確認
    log_ok = check_github_actions_log()
    
    if log_ok:
        # 2. デバッグ用再実行
        print("\n" + "="*50)
        trigger_ok = force_trigger_with_debug()
        
        if trigger_ok:
            print("\n🎯 次のステップ:")
            print("1. 10分待機")
            print("2. このスクリプトを再実行してログ確認")
            print("3. サイトでX投稿表示を確認")
        else:
            print("\n💡 手動でGitHub Actionsを実行してください:")
            print("https://github.com/awano27/daily-ai-news-pages/actions")

if __name__ == "__main__":
    main()