#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub Actions実行状況とログを確認
"""

import subprocess
import json
import sys

def check_workflow_status():
    """最新のワークフロー実行状況を確認"""
    print("🔍 GitHub Actions実行状況確認中...")
    
    try:
        work_dir = r'C:\Users\yoshitaka\daily-ai-news'
        
        # 最新の実行を確認
        result = subprocess.run(['gh', 'run', 'list', '--limit', '1', '--json', 'status,conclusion,workflowName,createdAt,url'], 
                              cwd=work_dir, capture_output=True, text=True)
        
        if result.returncode == 0:
            runs = json.loads(result.stdout)
            if runs:
                run = runs[0]
                print(f"📊 最新実行:")
                print(f"  ワークフロー: {run['workflowName']}")
                print(f"  状態: {run['status']}")
                print(f"  結果: {run.get('conclusion', 'N/A')}")
                print(f"  開始時刻: {run['createdAt']}")
                print(f"  URL: {run['url']}")
                
                # Enhanced Daily Build の最新実行を取得
                enhanced_result = subprocess.run([
                    'gh', 'run', 'list', 
                    '--workflow', 'enhanced-daily-build.yml',
                    '--limit', '1',
                    '--json', 'status,conclusion,databaseId'
                ], cwd=work_dir, capture_output=True, text=True)
                
                if enhanced_result.returncode == 0:
                    enhanced_runs = json.loads(enhanced_result.stdout)
                    if enhanced_runs:
                        enhanced_run = enhanced_runs[0]
                        run_id = enhanced_run['databaseId']
                        
                        print(f"\n📋 Enhanced Daily Build (ID: {run_id}):")
                        print(f"  状態: {enhanced_run['status']}")
                        print(f"  結果: {enhanced_run.get('conclusion', 'N/A')}")
                        
                        # ログを取得
                        print("\n📄 実行ログ:")
                        log_result = subprocess.run(['gh', 'run', 'view', str(run_id), '--log'], 
                                                  cwd=work_dir, capture_output=True, text=True)
                        
                        if log_result.returncode == 0:
                            log_lines = log_result.stdout.split('\n')
                            # X投稿関連のログを抽出
                            x_related_logs = []
                            for line in log_lines:
                                if any(keyword in line.lower() for keyword in ['x投稿', 'x posts', 'posts category', 'csv', 'debug']):
                                    x_related_logs.append(line)
                            
                            if x_related_logs:
                                print("🐦 X投稿関連ログ:")
                                for log in x_related_logs[-20:]:  # 最新20行
                                    print(f"  {log}")
                            else:
                                print("⚠️ X投稿関連ログが見つかりません")
                                print("📄 全ログの最後の50行:")
                                for line in log_lines[-50:]:
                                    print(f"  {line}")
                        else:
                            print(f"❌ ログ取得失敗: {log_result.stderr}")
                
                return True
            else:
                print("⚠️ 実行履歴が見つかりません")
                return False
        else:
            print(f"❌ GitHub CLI実行エラー: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

def check_csv_access():
    """CSVアクセスをテスト"""
    print("\n🧪 CSV取得テスト...")
    
    try:
        import requests
        csv_url = "https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0"
        
        response = requests.get(csv_url, timeout=30)
        print(f"📊 CSV取得結果: HTTP {response.status_code}")
        print(f"📄 データサイズ: {len(response.text)} 文字")
        print(f"🔍 最初の300文字: {response.text[:300]}")
        
        # 行数確認
        lines = response.text.strip().split('\n')
        print(f"📋 行数: {len(lines)}")
        
        return len(lines) > 1
        
    except Exception as e:
        print(f"❌ CSV取得エラー: {e}")
        return False

def main():
    """メイン処理"""
    print("🔍 X投稿表示問題の診断")
    print("=" * 50)
    
    # 1. GitHub Actions状況確認
    actions_ok = check_workflow_status()
    
    # 2. CSV取得テスト
    csv_ok = check_csv_access()
    
    print("\n📊 診断結果:")
    print(f"  GitHub Actions: {'✅ OK' if actions_ok else '❌ 問題あり'}")
    print(f"  CSV取得: {'✅ OK' if csv_ok else '❌ 問題あり'}")
    
    if not actions_ok or not csv_ok:
        print("\n💡 次のステップ:")
        if not csv_ok:
            print("  - CSV URLを確認してください")
            print("  - Google Sheetsのアクセス権限を確認してください")
        if not actions_ok:
            print("  - GitHub ActionsのSecretsを確認してください")
            print("  - ワークフロー実行権限を確認してください")

if __name__ == "__main__":
    main()