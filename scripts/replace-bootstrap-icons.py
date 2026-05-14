#!/usr/bin/env python3
"""Replace <i class="bi bi-*"> with SVG <use> refs into assets/icons/streamline-sprite.svg (built from vendor/streamline-vectors)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPRITE = "assets/icons/streamline-sprite.svg"

ICON_MAP: dict[str, str] = {
    "bi-layout-sidebar-inset": "ch-layout-sidebar",
    "bi-house-door": "ch-house",
    "bi-chat-dots": "ch-chat",
    "bi-file-earmark-bar-graph": "ch-file-graph",
    "bi-graph-up": "ch-graph-up",
    "bi-people": "ch-people",
    "bi-megaphone": "ch-megaphone",
    "bi-list-ul": "ch-list-ul",
    "bi-cloud-upload": "ch-cloud-upload",
    "bi-folder2-open": "ch-folder",
    "bi-diagram-3": "ch-diagram",
    "bi-gear": "ch-gear",
    "bi-grid-1x2": "ch-grid",
    "bi-arrow-up-circle": "ch-arrow-up-circle",
    "bi-list": "ch-menu",
    "bi-search": "ch-search",
    "bi-bell": "ch-bell",
    "bi-question-circle": "ch-help",
    "bi-chevron-down": "ch-chevron-down",
    "bi-chevron-right": "ch-chevron-right",
    "bi-lightning-charge": "ch-lightning",
    "bi-file-earmark": "ch-file-earmark",
    "bi-arrow-up-right": "ch-arrow-up-right",
    "bi-file-earmark-plus": "ch-file-plus",
    "bi-person-badge": "ch-person-badge",
    "bi-upload": "ch-upload",
    "bi-paperclip": "ch-paperclip",
    "bi-mic": "ch-mic",
    "bi-bookmarks": "ch-bookmarks",
    "bi-send-fill": "ch-send",
    "bi-check-circle": "ch-check",
    "bi-plus-lg": "ch-plus",
    "bi-three-dots-vertical": "ch-dots-vertical",
    "bi-exclamation-octagon-fill": "ch-alert-octagon",
    "bi-cloud-arrow-up": "ch-cloud-upload",
    "bi-filetype-csv": "ch-file-csv",
    "bi-geo-alt": "ch-pin",
    "bi-phone": "ch-phone",
    "bi-instagram": "ch-instagram",
    "bi-youtube": "ch-youtube",
    "bi-tiktok": "ch-tiktok",
}

TAG_RE = re.compile(
    r"<i\s+class=\"(?P<classes>[^\"]+)\"(?P<mid>\s[^>]*)?>\s*</i>",
    re.I,
)


def transform(classes: str) -> str | None:
    parts = classes.split()
    bi_tokens = [p for p in parts if p.startswith("bi-")]
    if not bi_tokens:
        return None
    icon_token = bi_tokens[0]
    sid = ICON_MAP.get(icon_token)
    if not sid:
        return None

    rest: list[str] = []
    size_mod = ""
    for p in parts:
        if p in ("bi",) or p.startswith("bi-"):
            continue
        if p == "small":
            size_mod = "ch-icon--sm"
            continue
        if p == "fs-1":
            size_mod = "ch-icon--2xl"
            continue
        if p == "fs-4":
            size_mod = "ch-icon--xl"
            continue
        rest.append(p)

    svg_classes = ["ch-icon", size_mod, *rest]
    svg_class = " ".join(c for c in svg_classes if c)
    aria = ' aria-hidden="true"'
    return f'<svg class="{svg_class}"{aria} focusable="false"><use href="{SPRITE}#{sid}"/></svg>'


def process_html(text: str) -> tuple[str, int]:
    count = 0

    def repl(m: re.Match[str]) -> str:
        nonlocal count
        out = transform(m.group("classes"))
        if out is None:
            return m.group(0)
        count += 1
        return out

    return TAG_RE.sub(repl, text), count


def main() -> int:
    total = 0
    for path in sorted(ROOT.glob("*.html")):
        raw = path.read_text(encoding="utf-8")
        new, n = process_html(raw)
        if n:
            path.write_text(new, encoding="utf-8")
            print(f"{path.name}: replaced {n} icon(s)")
            total += n
    print(f"Total: {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
