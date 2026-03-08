#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini-backed supplemental news collection.

This module uses Google Search grounding to fill gaps when RSS coverage is thin.
It returns a small number of recent, AI-specific articles and falls back to an
empty list on any API or parsing error.
"""
from __future__ import annotations

import json
import logging
import os
import re
from datetime import datetime, timezone
from typing import Any

try:
    from google import genai
    from google.genai.types import GenerateContentConfig, GoogleSearch, Tool
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


MODEL_ALIASES = {
    "gemini3.1flashlite": "gemini-3.1-flash-lite-preview",
    "gemini-3.1-flash-lite": "gemini-3.1-flash-lite-preview",
    "gemini 3.1 flash lite": "gemini-3.1-flash-lite-preview",
    "gemini31flashlite": "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash-lite": "gemini-3.1-flash-lite-preview",
    "gemini2.5flashlite": "gemini-3.1-flash-lite-preview",
    "gemini 2.5 flash lite": "gemini-3.1-flash-lite-preview",
}


CATEGORY_FOCUS = {
    "Business": "AI企業の資金調達、提携、M&A、規制、企業導入、主要企業の発表を優先する",
    "Tools": "AIツール、API、SDK、オープンソース公開、主要プロダクト更新を優先する",
    "Posts": "AI研究、論文解説、技術検証、研究者や開発者の重要な発信を優先する",
}


def normalize_model_name(model_name: str | None) -> str:
    if not model_name:
        return "gemini-3.1-flash-lite-preview"
    compact = re.sub(r"[\s_]+", "", model_name.strip().lower())
    return MODEL_ALIASES.get(compact, model_name.strip())


class GeminiNewsSupplementer:
    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = normalize_model_name(
            model
            or os.getenv("GEMINI_SUPPLEMENT_MODEL")
            or "gemini-3.1-flash-lite-preview"
        )
        self.enabled = bool(self.api_key and GENAI_AVAILABLE)
        self.client = None

        if not GENAI_AVAILABLE:
            logger.warning("google-genai is not installed; Gemini supplement is disabled")
            return
        if not self.api_key:
            logger.info("GEMINI_API_KEY is not configured; Gemini supplement is disabled")
            return

        try:
            self.client = genai.Client(api_key=self.api_key)
        except Exception as exc:
            logger.warning("Failed to initialize Gemini supplement client: %s", exc)
            self.enabled = False

    def collect_category_items(
        self,
        category_name: str,
        hours_lookback: int,
        max_items: int,
    ) -> list[dict[str, Any]]:
        if not self.enabled or not self.client or max_items <= 0:
            return []

        prompt = self._build_prompt(category_name, hours_lookback, max_items)
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=GenerateContentConfig(
                    temperature=0.2,
                    maxOutputTokens=2048,
                    responseMimeType="application/json",
                    tools=[Tool(googleSearch=GoogleSearch())],
                ),
            )
            payload = self._parse_json_response(getattr(response, "text", "") or "")
            return self._normalize_items(payload.get("items", []), category_name, max_items)
        except Exception as exc:
            logger.warning("Gemini supplemental collection failed for %s: %s", category_name, exc)
            return []

    def _build_prompt(self, category_name: str, hours_lookback: int, max_items: int) -> str:
        focus = CATEGORY_FOCUS.get(category_name, "AIに関係する高品質な一次情報・有力報道を優先する")
        return f"""
あなたはAIニュース収集アシスタントです。
{hours_lookback}時間以内の最新AI情報から、カテゴリ「{category_name}」に最も重要な項目を最大{max_items}件選んでください。

優先条件:
- {focus}
- できるだけ一次ソース、公式ブログ、主要メディア、論文/研究機関を優先
- AIと無関係な一般ニュースは除外
- 同じ話題の重複記事は1件に絞る
- リンク先は実在する記事URLにする
- 要約は120文字以内の日本語

以下のJSONだけを返してください:
{{
  "items": [
    {{
      "title": "記事タイトル",
      "url": "https://...",
      "source": "媒体名",
      "summary": "120文字以内の日本語要約",
      "published_hint": "2026-03-08T11:00:00Z"
    }}
  ]
}}
        """.strip()

    def _parse_json_response(self, text: str) -> dict[str, Any]:
        if not text:
            return {"items": []}

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if not match:
                return {"items": []}
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return {"items": []}

    def _normalize_items(
        self,
        raw_items: list[dict[str, Any]],
        category_name: str,
        max_items: int,
    ) -> list[dict[str, Any]]:
        normalized: list[dict[str, Any]] = []
        seen: set[tuple[str, str]] = set()

        for raw in raw_items:
            title = str(raw.get("title", "")).strip()
            url = str(raw.get("url", "")).strip()
            source = str(raw.get("source", "")).strip() or "Gemini Search"
            summary = str(raw.get("summary", "")).strip()

            if not title or not url.startswith("http"):
                continue

            key = (url.lower(), title.lower())
            if key in seen:
                continue
            seen.add(key)

            normalized.append({
                "title": title,
                "link": url,
                "_summary": summary,
                "_source": source,
                "_dt": self._parse_datetime(raw.get("published_hint")),
                "_gemini_collected": True,
                "_gemini_category": category_name.lower(),
            })

            if len(normalized) >= max_items:
                break

        return normalized

    @staticmethod
    def _parse_datetime(value: Any) -> datetime:
        if isinstance(value, str) and value.strip():
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                pass
        return datetime.now(timezone.utc)
