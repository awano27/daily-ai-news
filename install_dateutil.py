#!/usr/bin/env python3
"""
dateutil モジュールをインストール
"""

import subprocess
import sys

try:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'python-dateutil'])
    print("✅ python-dateutil インストール完了")
except Exception as e:
    print(f"❌ インストールエラー: {e}")