"""Download publicly available legal contract datasets.

Usage:
    python -m scripts.download_datasets

This script downloads datasets from official public sources where redistribution
is permitted. Datasets that already exist are skipped. Progress messages are
printed to stdout.

Datasets:
    1. CUAD (Contract Understanding Atticus Dataset) — CC BY 4.0
       Source: https://github.com/TheAtticusProject/cuad
    2. SEC EDGAR Sample Contracts — public domain (U.S. government work)
       Source: https://www.sec.gov/edgar/search/

Note: The Kaggle Legal Contract Dataset is NOT downloaded automatically because
Kaggle requires authentication and many datasets restrict redistribution. See
backend/sample_data/README.md for manual download instructions.
"""

from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent / "sample_data"

DATASETS = {
    "cuad": {
        "description": "CUAD (Contract Understanding Atticus Dataset)",
        "url": "https://github.com/TheAtticusProject/cuad/raw/master/CUAD_v1.zip",
        "filename": "CUAD_v1.zip",
        "subdir": "cuad",
    },
    "sec_sample": {
        "description": "SEC EDGAR sample contract (exhibit 10)",
        "url": "https://www.sec.gov/Archives/edgar/data/320193/000119312523088456/d565895dex10.htm",
        "filename": "sec_sample_exhibit10.htm",
        "subdir": "sec_edgar",
    },
}


def _download(url: str, dest: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "LegalLens-AI-downloader/1.0"})
        with urllib.request.urlopen(req, timeout=60) as response:
            data = response.read()
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return True
    except Exception as exc:
        print(f"  ERROR downloading {url}: {exc}")
        return False


def download_dataset(key: str, info: dict) -> None:
    dest_dir = BASE_DIR / info["subdir"]
    dest_file = dest_dir / info["filename"]
    print(f"\n[{info['description']}]")
    if dest_file.exists():
        print(f"  Already exists — skipping: {dest_file}")
        return
    print(f"  Downloading from: {info['url']}")
    print(f"  Saving to: {dest_file}")
    if _download(info["url"], dest_file):
        print(f"  Success ({dest_file.stat().st_size / 1024:.1f} KB)")
    else:
        print("  Download failed. See error above.")


def main() -> int:
    print("=" * 60)
    print("LegalLens AI — Dataset Downloader")
    print("=" * 60)
    print(f"Output directory: {BASE_DIR}")
    for key, info in DATASETS.items():
        download_dataset(key, info)
    print("\nDone. See backend/sample_data/README.md for manual download")
    print("instructions for datasets that require authentication (e.g. Kaggle).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
