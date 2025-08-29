#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修正されたビルドスクリプトを直接実行
"""

import os
import sys
import subprocess
import tempfile

def run_build():
    """ビルドを実行"""
    try:
        # 環境変数設定
        os.environ['TRANSLATE_TO_JA'] = '1'
        os.environ['TRANSLATE_ENGINE'] = 'google' 
        os.environ['HOURS_LOOKBACK'] = '24'
        os.environ['MAX_ITEMS_PER_CATEGORY'] = '25'
        os.environ['X_POSTS_CSV'] = 'https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0'
        
        print("🚀 修正されたビルドスクリプトを実行中...")
        
        # 一時ディレクトリを設定
        with tempfile.TemporaryDirectory() as temp_dir:
            os.environ['TEMP'] = temp_dir
            os.environ['TMP'] = temp_dir
            
            # build_simple_ranking.pyを実行
            result = subprocess.run([
                sys.executable, 'build_simple_ranking.py'
            ], cwd=r'C:\Users\yoshitaka\daily-ai-news', 
               capture_output=True, text=True, timeout=300)
            
            print("📄 標準出力:")
            print(result.stdout)
            
            if result.stderr:
                print("⚠️ エラー出力:")
                print(result.stderr)
            
            if result.returncode == 0:
                print("✅ ビルド成功！")
                return True
            else:
                print(f"❌ ビルド失敗 (戻り値: {result.returncode})")
                return False
                
    except Exception as e:
        print(f"❌ 実行エラー: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔧 修正版ビルドスクリプト実行開始...")
    success = run_build()
    if success:
        print("🎉 X投稿修正版ビルド完了！")
    else:
        print("💥 ビルドに問題が発生しました")