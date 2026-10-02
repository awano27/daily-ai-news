from pathlib import Path


def test_csv_publication_is_isolated_and_verifies_main_path():
    root = Path(__file__).resolve().parents[1]
    workflow = (root / ".github/workflows/run-csv-deploy.yml").read_text(encoding="utf-8")
    assert "destination_dir: daily-news-csv\n" in workflow
    assert "destination_dir: daily-news\n" not in workflow
    assert "commits?sha=main&path=daily-news-csv&per_page=1" in workflow
    assert "https://visionhub.jp/daily-news-csv/" in workflow
    template = (root / "templates/bootstrap_template.html").read_text(encoding="utf-8")
    assert 'rel="canonical" href="https://visionhub.jp/daily-news-csv/"' in template
    assert 'href="https://visionhub.jp/daily-news/"' in template
