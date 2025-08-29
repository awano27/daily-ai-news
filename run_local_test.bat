@echo off
echo 🧪 X投稿ローカルテスト実行中...

cd /d "C:\Users\yoshitaka\daily-ai-news"
python local_x_test.py

if exist test_x_posts.html (
    echo.
    echo ✅ テストHTML生成完了
    echo 📁 test_x_posts.html を確認してください
    start test_x_posts.html
) else (
    echo.
    echo ❌ テストHTMLが生成されませんでした
)

echo.
pause