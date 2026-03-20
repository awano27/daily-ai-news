#!/usr/bin/env python3
"""Collect posts from Bluesky API and output as CSV.

Usage:
    python bluesky_collector.py

Environment variables:
    BLUESKY_HANDLE    - Bluesky login handle (e.g. yourname.bsky.social)
    BLUESKY_PASSWORD  - Bluesky app password (Settings > App Passwords)
    BLUESKY_ACCOUNTS  - Comma-separated Bluesky handles to monitor
    BLUESKY_KEYWORDS  - Comma-separated search keywords
    BLUESKY_OUTPUT    - Output CSV path (default: _sources/bluesky_posts.csv)
    BLUESKY_HOURS     - Lookback window in hours (default: 36)
"""

import csv
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

try:
    from atproto import Client
except ImportError:
    print("[WARN] atproto not installed. Run: pip install atproto>=0.0.46")
    sys.exit(0)

# --- Config ---
BSKY_HANDLE = os.getenv("BLUESKY_HANDLE", "")
BSKY_PASSWORD = os.getenv("BLUESKY_PASSWORD", "")
ACCOUNTS = [a.strip() for a in os.getenv("BLUESKY_ACCOUNTS", "").split(",") if a.strip()]
KEYWORDS = [k.strip() for k in os.getenv("BLUESKY_KEYWORDS", "AI,LLM,GPT,Claude,Gemini").split(",") if k.strip()]
OUTPUT_PATH = os.getenv("BLUESKY_OUTPUT", "_sources/bluesky_posts.csv")
HOURS_BACK = int(os.getenv("BLUESKY_HOURS", "36"))

DEFAULT_ACCOUNTS = [
    "ylecun.bsky.social",
    "karpathy.bsky.social",
    "emollick.bsky.social",
    "simonw.bsky.social",
    "benparr.bsky.social",
]

JST = timezone(timedelta(hours=9))
CUTOFF = datetime.now(timezone.utc) - timedelta(hours=HOURS_BACK)


def parse_bsky_time(ts: str) -> datetime:
    """Parse Bluesky ISO 8601 timestamp."""
    try:
        if ts.endswith("Z"):
            ts = ts[:-1] + "+00:00"
        return datetime.fromisoformat(ts)
    except Exception:
        return datetime.now(timezone.utc)


def collect_from_accounts(client: Client, accounts: list[str]) -> list[dict]:
    """Fetch recent posts from specified accounts."""
    posts = []
    for handle in accounts:
        try:
            response = client.app.bsky.feed.get_author_feed(
                {"actor": handle, "limit": 10}
            )
            count = 0
            for item in response.feed:
                post = item.post
                created = parse_bsky_time(post.record.created_at)
                if created < CUTOFF:
                    continue
                text = post.record.text or ""
                if len(text) < 20:
                    continue
                rkey = post.uri.split("/")[-1]
                web_url = f"https://bsky.app/profile/{post.author.handle}/post/{rkey}"
                posts.append({
                    "date": created.astimezone(JST).strftime("%Y-%m-%d %H:%M"),
                    "user": f"@{post.author.handle}",
                    "text": text.replace("\n", " ").strip(),
                    "image": "",
                    "url": web_url,
                })
                count += 1
            print(f"  [OK] {handle}: {count} posts")
        except Exception as e:
            print(f"  [WARN] {handle}: {e}")
    return posts


def collect_from_search(client: Client, keywords: list[str]) -> list[dict]:
    """Search Bluesky for keyword matches."""
    posts = []
    seen_urls = set()
    for kw in keywords:
        try:
            response = client.app.bsky.feed.search_posts(
                {"q": kw, "limit": 15}
            )
            count = 0
            for post_view in response.posts:
                created = parse_bsky_time(post_view.record.created_at)
                if created < CUTOFF:
                    continue
                text = post_view.record.text or ""
                if len(text) < 30:
                    continue
                rkey = post_view.uri.split("/")[-1]
                web_url = f"https://bsky.app/profile/{post_view.author.handle}/post/{rkey}"
                if web_url in seen_urls:
                    continue
                seen_urls.add(web_url)
                posts.append({
                    "date": created.astimezone(JST).strftime("%Y-%m-%d %H:%M"),
                    "user": f"@{post_view.author.handle}",
                    "text": text.replace("\n", " ").strip(),
                    "image": "",
                    "url": web_url,
                })
                count += 1
            print(f"  [OK] Search '{kw}': {count} posts")
        except Exception as e:
            print(f"  [WARN] Search '{kw}': {e}")
    return posts


def deduplicate(posts: list[dict]) -> list[dict]:
    """Remove duplicates by URL."""
    seen = set()
    unique = []
    for p in posts:
        if p["url"] not in seen:
            seen.add(p["url"])
            unique.append(p)
    return unique


def write_csv(posts: list[dict], path: str):
    """Write posts to CSV matching existing Google Sheets format."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["日付", "@ユーザー", "テキスト", "画像URL", "ツイートURL"])
        for p in posts:
            writer.writerow([p["date"], p["user"], p["text"], p["image"], p["url"]])
    print(f"[SUCCESS] Wrote {len(posts)} posts to {path}")


def main():
    print("=" * 50)
    print("Bluesky Collector")
    print("=" * 50)

    accounts = ACCOUNTS if ACCOUNTS else DEFAULT_ACCOUNTS
    print(f"Accounts: {len(accounts)}, Keywords: {len(KEYWORDS)}, Lookback: {HOURS_BACK}h")

    client = Client()

    # Login required for feed/search API
    handle = BSKY_HANDLE
    password = BSKY_PASSWORD
    if not handle or not password:
        print("[WARN] BLUESKY_HANDLE and BLUESKY_PASSWORD not set.")
        print("       Create an app password at: https://bsky.app/settings/app-passwords")
        print("       Then set BLUESKY_HANDLE and BLUESKY_PASSWORD env vars.")
        # Write empty CSV so build.py doesn't break
        write_csv([], OUTPUT_PATH)
        return

    try:
        client.login(handle, password)
        print(f"[OK] Logged in as {handle}")
    except Exception as e:
        print(f"[ERROR] Login failed: {e}")
        write_csv([], OUTPUT_PATH)
        return

    all_posts = []

    print(f"\n--- Collecting from {len(accounts)} accounts ---")
    account_posts = collect_from_accounts(client, accounts)
    all_posts.extend(account_posts)
    print(f"Account posts: {len(account_posts)}")

    print(f"\n--- Searching {len(KEYWORDS)} keywords ---")
    search_posts = collect_from_search(client, KEYWORDS)
    all_posts.extend(search_posts)
    print(f"Search posts: {len(search_posts)}")

    unique = deduplicate(all_posts)
    print(f"\nTotal unique posts: {len(unique)}")

    write_csv(unique, OUTPUT_PATH)


if __name__ == "__main__":
    main()
