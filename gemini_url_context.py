#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini URL Context Client - GA版URL contextを使った統一的情報収集システム
"""
import os
import json
import logging
import re
from typing import List, Optional, Dict, Any
from datetime import datetime

# Gemini API imports
try:
    from google import genai
    from google.genai.types import GenerateContentConfig, HttpOptions
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print("❌ google-genai パッケージが必要です: pip install -U google-genai")

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_ALIASES = {
    "gemini-2.5-flash": "gemini-3.1-flash-lite-preview",
    "gemini 2.5 flash": "gemini-3.1-flash-lite-preview",
    "gemini25flash": "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash-lite": "gemini-3.1-flash-lite-preview",
    "gemini 2.5 flash lite": "gemini-3.1-flash-lite-preview",
    "gemini25flashlite": "gemini-3.1-flash-lite-preview",
    "gemini-3.1-flash-lite": "gemini-3.1-flash-lite-preview",
    "gemini 3.1 flash lite": "gemini-3.1-flash-lite-preview",
    "gemini31flashlite": "gemini-3.1-flash-lite-preview",
}


def normalize_model_name(model_name: Optional[str]) -> str:
    if not model_name:
        return "gemini-3.1-flash-lite-preview"
    compact = re.sub(r"[\s_]+", "", model_name.strip().lower())
    return MODEL_ALIASES.get(compact, model_name.strip())

class GeminiURLContextClient:
    """Gemini URL Context APIクライアント"""
    
    def __init__(self):
        """クライアント初期化"""
        if not GENAI_AVAILABLE:
            raise ImportError("google-genai パッケージをインストールしてください")
        
        self.client = self._make_client()
        self.default_model = normalize_model_name(
            os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview")
        )
        
    def _make_client(self) -> 'genai.Client':
        """Geminiクライアント作成（Vertex AI対応）"""
        use_vertex = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() in ("1", "true", "yes")
        
        if use_vertex:
            logger.info("🔧 Vertex AI経路で初期化中...")
            return genai.Client(http_options=HttpOptions(api_version="v1"))
        else:
            logger.info("🔧 Developer API経路で初期化中...")
            return genai.Client()
    
    def generate_from_urls(
        self,
        prompt: str,
        urls: List[str],
        model: Optional[str] = None,
        enable_search: bool = False,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        URLを直接指定してGeminiで内容を解析
        
        Args:
            prompt: 解析指示プロンプト
            urls: 対象URLリスト（最大20URL）
            model: 使用モデル
            enable_search: Google Search併用
            max_retries: リトライ回数
            
        Returns:
            解析結果辞書（text, url_context_metadata, usage_metadata含む）
        """
        if not urls:
            raise ValueError("URLリストが空です")
        
        if len(urls) > 20:
            logger.warning(f"⚠️ URL数が制限を超過: {len(urls)} > 20")
            urls = urls[:20]
        
        model_id = model or self.default_model
        logger.info(f"🤖 Gemini解析開始: model={model_id}, urls={len(urls)}件")
        
        # ツール設定
        tools = [{"url_context": {}}]
        
        # Google Search有効化
        if enable_search or os.getenv("ENABLE_GOOGLE_SEARCH", "").lower() in ("1", "true", "yes"):
            tools.append({"google_search": {}})
            logger.info("🔍 Google Search grounding有効")
        
        # プロンプト構築
        content_text = f"{prompt}\\n\\n対象URL:\\n" + "\\n".join(urls)
        
        # API実行（リトライ付き）
        for attempt in range(max_retries + 1):
            try:
                logger.info(f"📡 API呼び出し中... (試行 {attempt + 1}/{max_retries + 1})")
                
                resp = self.client.models.generate_content(
                    model=model_id,
                    contents=content_text,
                    config=GenerateContentConfig(tools=tools),
                )
                
                # レスポンス解析
                result = self._parse_response(resp, urls)
                
                # 成功ログ
                self._log_success(result, model_id, len(urls))
                
                return result
                
            except Exception as e:
                logger.error(f"❌ API呼び出し失敗 (試行 {attempt + 1}): {e}")
                
                if attempt == max_retries:
                    # 最終試行でも失敗
                    return {
                        "text": f"エラー: URL解析に失敗しました - {str(e)}",
                        "url_context_metadata": None,
                        "usage_metadata": None,
                        "error": str(e),
                        "raw": None
                    }
                
                # リトライ待機
                import time
                time.sleep(2 ** attempt)
        
        return {}
    
    def _parse_response(self, resp: Any, urls: List[str]) -> Dict[str, Any]:
        """Geminiレスポンスを解析"""
        
        # テキスト本文
        text = getattr(resp, "text", None) or "テキストが取得できませんでした"
        
        # URL context metadata（根拠情報）
        url_meta = None
        if hasattr(resp, 'candidates') and resp.candidates:
            url_meta = getattr(resp.candidates[0], 'url_context_metadata', None)
        
        # 使用量メタデータ（コスト計算用）
        usage = getattr(resp, "usage_metadata", None)
        
        return {
            "text": text,
            "url_context_metadata": url_meta,
            "usage_metadata": usage,
            "raw": resp,
            "timestamp": datetime.now().isoformat(),
            "input_urls": urls
        }
    
    def _log_success(self, result: Dict[str, Any], model: str, url_count: int):
        """成功ログの出力"""
        usage = result.get("usage_metadata")
        
        if usage:
            # トークン使用量をログ出力（コスト見積の根拠）
            prompt_tokens = getattr(usage, 'prompt_token_count', 0)
            completion_tokens = getattr(usage, 'candidates_token_count', 0)
            total_tokens = getattr(usage, 'total_token_count', 0)
            
            logger.info(f"✅ 解析完了: model={model}")
            logger.info(f"📊 使用量: prompt={prompt_tokens}, completion={completion_tokens}, total={total_tokens} tokens")
            logger.info(f"🔗 対象URL数: {url_count}")
        else:
            logger.info(f"✅ 解析完了: model={model}, URLs={url_count}")
        
        # URL context metadataの概要
        url_meta = result.get("url_context_metadata")
        if url_meta:
            logger.info(f"🌐 URL context metadata取得済み")
    
    def summarize_news_articles(
        self,
        article_urls: List[str],
        focus_topics: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """ニュース記事の要約（AI業界特化）"""
        
        focus_text = ""
        if focus_topics:
            focus_text = f"\\n\\n特に以下のトピックに注目して解析してください:\\n- " + "\\n- ".join(focus_topics)
        
        prompt = f"""
以下のAI業界ニュース記事を分析し、包括的な要約を日本語で提供してください。

## 分析項目:
1. **主要なニュース**: 各記事の核心的な内容
2. **技術トレンド**: 言及されている技術や製品
3. **企業動向**: 関連企業とその活動
4. **業界への影響**: AI業界全体への意味合い
5. **日本市場への関連性**: 日本のAI業界への影響

## 出力形式:
- 各記事ごとに要約（2-3文）
- 全体の傾向分析
- 重要度ランキング（上位3記事）

{focus_text}

記事のタイトル、発信元、発表日時も含めて整理してください。
        """.strip()
        
        return self.generate_from_urls(
            prompt=prompt,
            urls=article_urls,
            enable_search=False  # ニュース記事は直接読み取り
        )
    
    def analyze_product_documentation(
        self,
        doc_urls: List[str],
        analysis_type: str = "features"
    ) -> Dict[str, Any]:
        """製品ドキュメントの分析"""
        
        if analysis_type == "features":
            prompt = """
以下の製品ドキュメントやAPIドキュメントから、主要な機能と仕様を抽出してください。

## 抽出項目:
1. **主要機能**: 製品/APIの核心機能
2. **技術仕様**: システム要件、制限、パフォーマンス
3. **料金・制限**: 利用料金、レート制限、使用制限
4. **統合方法**: APIの使用方法、SDKサポート
5. **競合優位性**: 他社製品との差別化要素

出力は構造化された形式で、開発者が理解しやすいように整理してください。
            """.strip()
        
        elif analysis_type == "comparison":
            prompt = """
以下の複数の製品/サービスを比較分析してください。

## 比較項目:
1. **機能比較表**: 主要機能の有無
2. **価格比較**: 料金体系の違い
3. **パフォーマンス**: 速度、精度、可用性
4. **使いやすさ**: 導入難易度、学習コスト
5. **推奨用途**: どのような用途に最適か

結論として、用途別の推奨製品を提示してください。
            """.strip()
        
        else:
            prompt = f"""
以下のドキュメントを{analysis_type}の観点から分析してください。
技術的な詳細と実用的な観点の両方を含めて、日本語で包括的に説明してください。
            """.strip()
        
        return self.generate_from_urls(
            prompt=prompt,
            urls=doc_urls,
            enable_search=True  # 技術文書は関連情報も検索
        )
    
    def extract_research_insights(
        self,
        paper_urls: List[str],
        research_focus: Optional[str] = None
    ) -> Dict[str, Any]:
        """研究論文からのインサイト抽出"""
        
        focus_text = f"\\n\\n特に{research_focus}に関連する内容に注目してください。" if research_focus else ""
        
        prompt = f"""
以下の研究論文やテクニカルレポートから、重要なインサイトを抽出してください。

## 抽出項目:
1. **研究の背景**: なぜこの研究が重要なのか
2. **主要な発見**: 新しい知見や技術的ブレークスルー
3. **手法・アプローチ**: 使用された技術や方法論
4. **実験結果**: 定量的な成果や性能改善
5. **実用化の可能性**: 産業応用の潜在性
6. **今後の研究方向**: 残された課題と発展性

{focus_text}

学術的内容を実務者にも分かりやすく説明し、AI業界への影響を考察してください。
        """.strip()
        
        return self.generate_from_urls(
            prompt=prompt,
            urls=paper_urls,
            enable_search=True
        )

# グローバルクライアントインスタンス
_client = None

def get_client() -> GeminiURLContextClient:
    """シングルトンクライアント取得"""
    global _client
    if _client is None:
        _client = GeminiURLContextClient()
    return _client

# 便利関数群
def summarize_urls(prompt: str, urls: List[str], **kwargs) -> Dict[str, Any]:
    """URLを直接要約"""
    return get_client().generate_from_urls(prompt, urls, **kwargs)

def analyze_news_batch(article_urls: List[str], focus_topics: List[str] = None) -> Dict[str, Any]:
    """ニュース記事バッチ解析"""
    return get_client().summarize_news_articles(article_urls, focus_topics)

def compare_products(product_urls: List[str]) -> Dict[str, Any]:
    """製品比較分析"""
    return get_client().analyze_product_documentation(product_urls, "comparison")

def extract_research(paper_urls: List[str], focus: str = None) -> Dict[str, Any]:
    """研究論文インサイト抽出"""
    return get_client().extract_research_insights(paper_urls, focus)

if __name__ == "__main__":
    print("🧪 Gemini URL Context テスト実行中...")
    
    # テスト用URL
    test_urls = [
        "https://ai.google.dev/gemini-api/docs/url-context",
        "https://developers.googleblog.com/en/gemini-api-url-context-ga/"
    ]
    
    try:
        client = GeminiURLContextClient()
        
        result = client.generate_from_urls(
            prompt="これらのページの要点を3つのポイントで日本語要約してください。",
            urls=test_urls,
            enable_search=False
        )
        
        print("✅ テスト成功!")
        print(f"📝 要約: {result['text'][:200]}...")
        print(f"📊 使用量: {result['usage_metadata']}")
        print(f"🔗 URL metadata: {'取得済み' if result['url_context_metadata'] else 'なし'}")
        
    except Exception as e:
        print(f"❌ テスト失敗: {e}")
        import traceback
        traceback.print_exc()
