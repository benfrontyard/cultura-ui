#!/usr/bin/env python3
"""Remove orphaned chDemoModal markup (no triggers in product)."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PAGES = [
    "audiences.html",
    "library.html",
    "settings.html",
    "activations.html",
]

PATTERN = re.compile(
    r"\n    <div class=\"modal fade\" id=\"chDemoModal\".*?</div>\n    </div>\n",
    re.DOTALL,
)


def main() -> None:
    for rel in PAGES:
        path = ROOT / rel
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        new_text, n = PATTERN.subn("\n", text)
        if n:
            path.write_text(new_text, encoding="utf-8")
            print(f"Removed chDemoModal from {rel}")


if __name__ == "__main__":
    main()
