#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
X投稿修正を強制実行・GitHub Actionsトリガー
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from datetime import datetime, timezone, timedelta
import tempfile

def force_build():
    """修正版ビルドを強制実行"""
    print("🚀 X投稿修正版ビルド強制実行開始...")
    
    # 環境変数設定
    env = os.environ.copy()
    env.update({
        'TRANSLATE_TO_JA': '1',
        'TRANSLATE_ENGINE': 'google',
        'HOURS_LOOKBACK': '24', 
        'MAX_ITEMS_PER_CATEGORY': '25',
        'X_POSTS_CSV': 'https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0'
    })
    
    # 作業ディレクトリ
    work_dir = Path('C:/Users/yoshitaka/daily-ai-news')
    
    try:
        # build_simple_ranking.pyの直接実行を試行
        print("📁 作業ディレクトリ:", work_dir)
        print("🐍 Python実行ファイル:", sys.executable)
        
        # Pythonコードを直接実行
        build_code = '''
import os
import sys
sys.path.insert(0, r"C:\\Users\\yoshitaka\\daily-ai-news")

# 環境変数設定
os.environ["TRANSLATE_TO_JA"] = "1"
os.environ["TRANSLATE_ENGINE"] = "google"
os.environ["HOURS_LOOKBACK"] = "24"
os.environ["MAX_ITEMS_PER_CATEGORY"] = "25"
os.environ["X_POSTS_CSV"] = "https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0"

print("🔧 X投稿修正版ビルド実行中...")
print("📊 設定:")
print(f"  HOURS_LOOKBACK: {os.environ['HOURS_LOOKBACK']}")
print(f"  MAX_ITEMS_PER_CATEGORY: {os.environ['MAX_ITEMS_PER_CATEGORY']}")

try:
    # build_simple_ranking.pyをインポートして実行
    exec(open(r"C:\\Users\\yoshitaka\\daily-ai-news\\build_simple_ranking.py").read())
    print("\\n✅ ビルド成功！")
except Exception as e:
    print(f"\\n❌ ビルドエラー: {e}")
    import traceback
    traceback.print_exc()
'''
        
        print("💻 Pythonコード実行中...")
        exec(build_code)
        
        # index.htmlが生成されているか確認
        index_file = work_dir / 'index.html'
        if index_file.exists():
            size = index_file.stat().st_size
            print(f"✅ index.html生成確認: {size} bytes")
            
            # X投稿がPostsセクションに含まれているかチェック
            with open(index_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            x_posts_count = content.count('🐦 @')
            posts_section = 'data-category="posts"' in content
            
            print(f"📊 X投稿検出: {x_posts_count}件")
            print(f"📂 Postsセクション: {'存在' if posts_section else '未検出'}")
            
            if x_posts_count > 0:
                print("🎉 X投稿の修正が成功しました！")
                return True
            else:
                print("⚠️ X投稿が検出されませんでした")
                return False
        else:
            print("❌ index.htmlが生成されませんでした")
            return False
            
    except Exception as e:
        print(f"❌ 強制ビルドエラー: {e}")
        import traceback
        traceback.print_exc()
        return False

def trigger_github_actions():
    """GitHub Actionsをトリガー"""
    try:
        print("\n🔄 GitHub Actionsトリガー中...")
        
        # git操作
        subprocess.run(['git', 'add', '.'], cwd=r'C:\Users\yoshitaka\daily-ai-news', check=True)
        
        timestamp = datetime.now(timezone(timedelta(hours=9))).strftime('%Y-%m-%d %H:%M JST')
        commit_msg = f"fix: X投稿表示修正 - CSV処理改善 {timestamp}"
        
        subprocess.run(['git', 'commit', '-m', commit_msg], 
                      cwd=r'C:\Users\yoshitaka\daily-ai-news', check=True)
        
        subprocess.run(['git', 'push', 'origin', 'main'], 
                      cwd=r'C:\Users\yoshitaka\daily-ai-news', check=True)
        
        print("✅ GitHub Actionsトリガー完了")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Git操作エラー: {e}")
        return False
    except Exception as e:
        print(f"❌ トリガーエラー: {e}")
        return False

if __name__ == "__main__":
    print("🔥 X投稿修正 - 強制ビルド & デプロイ")
    print("=" * 50)
    
    # 1. 修正版ビルド実行
    build_success = force_build()
    
    if build_success:
        # 2. GitHub Actionsトリガー
        trigger_success = trigger_github_actions()
        
        if trigger_success:
            print("\n🎉 全処理完了！")
            print("📡 GitHub Actionsが自動実行されます")
            print("🌐 数分後にサイトが更新されます")
        else:
            print("\n⚠️ ローカルビルドは成功、デプロイに課題あり")
    else:
        print("\n💥 ビルドに問題があります")