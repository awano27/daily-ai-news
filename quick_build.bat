@echo off
echo 🚀 X投稿修正版ビルド開始...

set TRANSLATE_TO_JA=1
set TRANSLATE_ENGINE=google
set HOURS_LOOKBACK=24
set MAX_ITEMS_PER_CATEGORY=25
set X_POSTS_CSV=https://docs.google.com/spreadsheets/d/1uuLKCLIJw--a1vCcO6UGxSpBiLTtN8uGl2cdMb6wcfg/export?format=csv&gid=0

echo 📊 環境設定完了
echo   TRANSLATE_TO_JA=%TRANSLATE_TO_JA%
echo   HOURS_LOOKBACK=%HOURS_LOOKBACK%
echo   MAX_ITEMS_PER_CATEGORY=%MAX_ITEMS_PER_CATEGORY%

echo.
echo 🔧 修正されたビルドスクリプト実行中...
python build_simple_ranking.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ビルド成功！
    echo 📄 index.htmlが生成されました
    echo 🎯 X投稿の表示修正が適用されています
) else (
    echo.
    echo ❌ ビルドエラー（戻り値: %ERRORLEVEL%）
)

echo.
echo 🏁 処理完了
pause