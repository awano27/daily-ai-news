# IFTTT Setup Guide for X (Twitter) Auto-Collection

## Overview

IFTTTを使って、Xの公式アカウント投稿とキーワード検索を自動的にGoogle Sheetsに収集する設定ガイド。

## 前提条件

- IFTTTアカウント（Pro プラン $3.49/月、20 Applet まで）
- Google アカウント（Sheets用）
- 既存のGoogle Sheets URL（build.py の X_POSTS_CSV で参照されるもの）

## Applet の作成手順

### A. 公式アカウント監視（12 Applet）

1. https://ifttt.com/create にアクセス
2. **If This**: 「Twitter/X」→「New tweet by a specific user」を選択
3. **Username**: 例: `OpenAI`
4. **Then That**: 「Google Sheets」→「Add row to spreadsheet」を選択
5. 設定:
   - **Spreadsheet name**: `x_favorites`（既存のシート名に合わせる）
   - **Formatted row**: `{{CreatedAt}} ||| @{{UserName}} ||| {{Text}} ||| {{FirstLinkUrl}} ||| {{LinkToTweet}}`
   - **Drive folder path**: `IFTTT/Twitter`

以下のアカウントで繰り返す:

| # | アカウント | 理由 |
|---|-----------|------|
| 1 | @OpenAI | GPTシリーズ公式 |
| 2 | @AnthropicAI | Claude公式 |
| 3 | @GoogleDeepMind | Gemini/研究発表 |
| 4 | @MetaAI | Llama/研究発表 |
| 5 | @nvidia | GPU/AI基盤 |
| 6 | @Microsoft | Copilot/Azure AI |
| 7 | @stability_ai | Stable Diffusion |
| 8 | @MistralAI | オープンモデル |
| 9 | @xaboratory | xAI/Grok |
| 10 | @huggingface | モデルハブ |
| 11 | @LangChainAI | AIフレームワーク |
| 12 | @awscloud | AWS AI サービス |

### B. キーワード検索（8 Applet）

1. **If This**: 「Twitter/X」→「New tweet from search」を選択
2. **Search for**: 下記のキーワードを入力
3. **Then That**: Google Sheets へ追加（同じ設定）

| # | 検索キーワード | 目的 |
|---|---------------|------|
| 1 | "AI launch" OR "AI release" | 新製品発表 |
| 2 | "LLM" min_faves:100 | バズったLLM投稿 |
| 3 | "GPT" min_faves:50 | GPT関連の注目投稿 |
| 4 | "Claude" min_faves:50 | Claude関連 |
| 5 | "Gemini AI" min_faves:50 | Gemini関連 |
| 6 | "AI funding" OR "AI投資" | 資金調達ニュース |
| 7 | "AI regulation" OR "AI規制" | 規制動向 |
| 8 | "AI agent" min_faves:100 | AIエージェント関連 |

`min_faves:N` を使うとエンゲージメントの低い投稿を除外できます。

## Google Sheets 列構成

build.py の `gather_x_posts()` が読み込める形式:

| 列 | 内容 | IFTTT変数 |
|----|------|-----------|
| A | 日付 | `{{CreatedAt}}` |
| B | @ユーザー | `@{{UserName}}` |
| C | テキスト | `{{Text}}` |
| D | 画像URL | `{{FirstLinkUrl}}` |
| E | ツイートURL | `{{LinkToTweet}}` |

**注意**: IFTTTのデフォルト区切りは `|||`。Google Sheetsが列を自動分割しない場合、Formatted row でセパレータを調整するか、Sheets側で `SPLIT()` 関数を使ってください。

## Bluesky アカウント設定

Bluesky連携には無料アカウントとアプリパスワードが必要:

1. https://bsky.app でアカウント作成（無料）
2. Settings > App Passwords > 「Add App Password」
3. 生成されたパスワードをGitHub Secretsに登録:
   - `BLUESKY_HANDLE`: yourname.bsky.social
   - `BLUESKY_PASSWORD`: 生成されたアプリパスワード

## GitHub Secrets に必要な値

| Secret名 | 値 | 用途 |
|----------|-----|------|
| `PERSONAL_TOKEN` | GitHub PAT | ai-news-siteへのデプロイ |
| `BLUESKY_HANDLE` | yourname.bsky.social | Bluesky API認証 |
| `BLUESKY_PASSWORD` | アプリパスワード | Bluesky API認証 |

## 注意事項

- IFTTTのポーリング間隔は約15分（リアルタイムではないが日次ビルドには十分）
- Bluesky APIは無料・レート制限3000 req/5分（十分余裕あり）
- Blueskyアカウント/パスワードが未設定でもビルドは正常に動作（X + RSSのみ）
- Google Sheetsの行数上限は500万行（日次数十行なので問題なし）
