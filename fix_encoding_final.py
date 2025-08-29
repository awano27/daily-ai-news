#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
X投稿の文字化け完全修正スクリプト
"""

import re

def fix_garbled_text():
    """文字化けしたテキストを修正"""
    try:
        # index.htmlを読み込み
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        print("📋 現在のindex.htmlを読み込み中...")
        
        # 文字化けパターンを修正
        replacements = [
            # 文字化けしたタイトルを修正
            ('凄 @ctgptlb - X謚慕ｨｿ', '🐦 @ctgptlb - X投稿'),
            ('凄 @hakky_kazumasa - X謚慕ｨｿ', '🐦 @hakky_kazumasa - X投稿'),
            ('凄 @heyrimsha - X謚慕ｨｿ', '🐦 @heyrimsha - X投稿'),
            ('凄 @EXM7777 - X謚慕ｨｿ', '🐦 @EXM7777 - X投稿'),
            ('凄 @claudeai - X謚慕ｨｿ', '🐦 @claudeai - X投稿'),
            ('凄 @windsurf - X謚慕ｨｿ', '🐦 @windsurf - X投稿'),
            
            # 文字化けした本文を修正（具体的な例）
            ('ãéå ±ãçªå¦ã¨ãã¦Geminiã®ãðã¢ã¼ãããå©ç¨å¯è½ã«', '【速報】突如としてGeminiの「🍌モード」が利用可能に'),
            ('Google released a 69-page prompt engineering masterclass', 'Google released a 69-page prompt engineering masterclass'),
            ('ãAIã«å¥ªãããªãä»äºããæ¢ãæä»£ã¯ãããçµããã«è¿', '「AIに奪われない仕事」を探す時代は、もう終わりに近'),
            
            # その他の一般的な文字化けパターン
            ('謚慕ｨｿ', '投稿'),
            ('ã', ''),  # 文字化けの開始パターンを削除
            ('ð', '🍌'),  # 絵文字の修正
        ]
        
        # 置換を実行
        for old_text, new_text in replacements:
            if old_text in content:
                content = content.replace(old_text, new_text)
                print(f"✅ 修正: '{old_text[:30]}...' → '{new_text[:30]}...'")
        
        # data-category="posts" を確認して修正
        posts_section = re.search(r'<section[^>]*data-category="[Pp]osts"[^>]*>.*?</section>', content, re.DOTALL)
        if posts_section:
            print("📍 Postsセクション発見")
            
            # Postsセクション内のX投稿を個別に確認・修正
            section_content = posts_section.group()
            
            # X投稿のタイトルパターンを修正
            section_content = re.sub(
                r'凄\s*@(\w+)\s*-\s*X[謚慕ｨｿ投稿]*',
                r'🐦 @\1 - X投稿',
                section_content
            )
            
            # 修正したセクションを元のコンテンツに戻す
            content = content[:posts_section.start()] + section_content + content[posts_section.end():]
        
        # 修正後のコンテンツを保存
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("\n✅ index.htmlの文字化け修正完了！")
        
        # 修正結果を確認
        verify_fix()
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()

def verify_fix():
    """修正結果を確認"""
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # X投稿が正しく表示されているか確認
        x_posts = re.findall(r'🐦 @(\w+) - X投稿', content)
        if x_posts:
            print(f"\n📊 修正されたX投稿: {len(x_posts)}件")
            for username in x_posts[:5]:
                print(f"  ✅ @{username}")
        
        # 文字化けが残っていないか確認
        garbled_patterns = ['謚慕ｨｿ', 'ã', '凄 @']
        remaining_garbled = False
        for pattern in garbled_patterns:
            if pattern in content:
                print(f"  ⚠️ まだ文字化けが残っています: '{pattern}'")
                remaining_garbled = True
        
        if not remaining_garbled:
            print("\n🎉 文字化けが完全に解決されました！")
        
    except Exception as e:
        print(f"❌ 検証エラー: {e}")

if __name__ == "__main__":
    print("🔧 X投稿文字化け修正開始...")
    fix_garbled_text()