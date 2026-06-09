#!/usr/bin/env python3
"""Remove redundant Workspace nav labels from duplicated shell."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

NAV_LABEL = re.compile(
    r'\n\s*<p class="ch-nav-section-label"[^>]*>Workspace</p>\n',
)


def patch_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    updated = NAV_LABEL.sub("\n", text)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        print(f"patched {path.relative_to(ROOT)}")


def main() -> int:
    for html in sorted(ROOT.rglob("*.html")):
        patch_file(html)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
