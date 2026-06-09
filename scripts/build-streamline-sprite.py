#!/usr/bin/env python3
"""
Build assets/icons/streamline-sprite.svg from the GitHub streamline-vectors repo.

Source of truth: git submodule at vendor/streamline-vectors
  https://github.com/webalys-hq/streamline-vectors

After clone or submodule init:
  git submodule update --init --depth 1 vendor/streamline-vectors
  python3 scripts/build-streamline-sprite.py

Also updates assets/js/ch-icon-sprite-inject.js when Node is available (for file:// icon support).
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VECTORS = ROOT / "vendor" / "streamline-vectors"
OUT = ROOT / "assets" / "icons" / "streamline-sprite.svg"

# (symbol_id, relative_path_from_vectors_root)
SOURCES: list[tuple[str, str]] = [
    ("ch-layout-sidebar", "ultimate/regular/programing-apps-websites/sidebar-line-left.svg"),
    ("ch-house", "ultimate/regular/interface-essential/house-1.svg"),
    ("ch-globe", "ultimate/regular/programing-apps-websites/coding-apps-website-network-globe.svg"),
    ("ch-chat", "ultimate/regular/messages-chat-smileys/messages-bubble-text.svg"),
    ("ch-file-graph", "ultimate/regular/files-folders/office-file-graph.svg"),
    ("ch-graph-up", "ultimate/regular/business-products/analytics-graph-lines-2.svg"),
    ("ch-people", "ultimate/regular/users/multiple-users-1.svg"),
    ("ch-megaphone", "ultimate/regular/interface-essential/megaphone.svg"),
    ("ch-list-ul", "ultimate/regular/interface-essential/arrange-list-descending.svg"),
    ("ch-cloud-upload", "ultimate/regular/internet-networks-servers/upload-circle.svg"),
    ("ch-folder", "ultimate/regular/files-folders/folder-hold.svg"),
    ("ch-file-stack", "ultimate/regular/files-folders/common-file-stack.svg"),
    ("ch-export", "ultimate/regular/files-folders/export-file.svg"),
    ("ch-rocket", "ultimate/regular/business-products/startup-product-rocket-box.svg"),
    ("ch-view", "ultimate/regular/interface-essential/view-square.svg"),
    ("ch-eye", "ultimate/regular/interface-essential/view-square.svg"),
    ("ch-eye-off", "ultimate/regular/interface-essential/lock-5.svg"),
    ("ch-check-circle", "ultimate/regular/interface-essential/check-badge.svg"),
    ("ch-lock", "ultimate/regular/interface-essential/lock-5.svg"),
    ("ch-diagram", "ultimate/regular/programing-apps-websites/module-three.svg"),
    ("ch-gear", "ultimate/regular/interface-essential/cog.svg"),
    ("ch-grid", "ultimate/regular/interface-essential/layout-11.svg"),
    ("ch-arrow-up-circle", "ultimate/regular/arrows-diagrams/arrow-double-up.svg"),
    ("ch-menu", "ultimate/regular/interface-essential/navigation-menu-1.svg"),
    ("ch-search", "ultimate/regular/interface-essential/search-circle.svg"),
    ("ch-bell", "ultimate/regular/interface-essential/alert-bell-notification-2.svg"),
    ("ch-help", "ultimate/regular/interface-essential/help-question-network.svg"),
    ("ch-chevron-down", "ultimate/regular/arrows-diagrams/arrow-down-2.svg"),
    ("ch-chevron-right", "ultimate/regular/arrows-diagrams/arrow-right.svg"),
    ("ch-lightning", "ultimate/regular/computers-devices-electronics/computer-chip-flash.svg"),
    ("ch-file-earmark", "ultimate/regular/files-folders/office-file-text.svg"),
    ("ch-arrow-up-right", "ultimate/regular/arrows-diagrams/arrow-thick-right-bottom-corner-3.svg"),
    ("ch-file-plus", "ultimate/regular/files-folders/common-file-text-add.svg"),
    ("ch-person-badge", "ultimate/regular/users/single-neutral-circle.svg"),
    ("ch-upload", "ultimate/regular/internet-networks-servers/upload-square.svg"),
    ("ch-paperclip", "ultimate/regular/interface-essential/attachment.svg"),
    ("ch-mic", "ultimate/regular/music-audio/microphone-1.svg"),
    ("ch-bookmarks", "ultimate/regular/interface-essential/bookmarks-document.svg"),
    ("ch-send", "ultimate/regular/emails/send-email-fly.svg"),
    ("ch-check", "ultimate/regular/interface-essential/check-double.svg"),
    ("ch-plus", "ultimate/regular/interface-essential/plus-one-increment.svg"),
    ("ch-alert-octagon", "ultimate/regular/interface-essential/alert-octagon-1.svg"),
    ("ch-file-csv", "ultimate/regular/files-folders/common-file-horizontal.svg"),
    ("ch-pin", "ultimate/regular/maps-navigation/pin-2.svg"),
    ("ch-phone", "ultimate/regular/phones-mobile-devices/phone-mobile-device-iphone-x-2.svg"),
    ("ch-instagram", "ultimate/regular/logos/instagram-logo.svg"),
    ("ch-youtube", "logos/line/videos/youtube-logo.svg"),
    ("ch-tiktok", "logos/line/social-medias/tiktok-logo.svg"),
]

# Mirror of arrow-right.svg so back/forward history controls match.
CHEVRON_LEFT = """
<symbol id="ch-chevron-left" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M0.75 12h22.5" stroke-width="1.5"/>
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M11.25 22.5 0.75 12 11.25 1.5" stroke-width="1.5"/>
</symbol>
""".strip()

DOTS_VERTICAL = """
<symbol id="ch-dots-vertical" viewBox="0 0 24 24">
  <circle cx="12" cy="5" r="1.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="12" cy="12" r="1.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="12" cy="19" r="1.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</symbol>
""".strip()


def normalize_svg_inner(raw: str) -> str:
    raw = raw.replace("#000000", "currentColor")
    raw = raw.replace("#000", "currentColor")
    m = re.search(r"<svg[^>]*>(.*)</svg>\s*$", raw, re.S | re.I)
    if not m:
        raise ValueError("Could not parse SVG body")
    inner = m.group(1).strip()
    inner = re.sub(r"<desc>.*?</desc>\s*", "", inner, flags=re.S | re.I)
    return inner


def main() -> int:
    if not VECTORS.is_dir():
        print(
            f"Missing {VECTORS}. From repo root run:\n"
            "  git submodule update --init --depth 1 vendor/streamline-vectors",
            file=sys.stderr,
        )
        return 1
    parts: list[str] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<!-- Icons from GitHub: https://github.com/webalys-hq/streamline-vectors (see repo license / attribution). -->",
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0" style="position:absolute;overflow:hidden;clip:rect(0,0,0,0)">',
    ]
    for sid, rel in SOURCES:
        p = VECTORS / rel
        if not p.is_file():
            print(f"Missing file: {p}", file=sys.stderr)
            return 1
        inner = normalize_svg_inner(p.read_text(encoding="utf-8"))
        parts.append(f'<symbol id="{sid}" viewBox="0 0 24 24">{inner}</symbol>')
    parts.append(CHEVRON_LEFT)
    parts.append(DOTS_VERTICAL)
    parts.append("</svg>")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(parts) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")
    sync = ROOT / "scripts" / "sync-ch-icon-sprite-inject.mjs"
    if sync.is_file():
        try:
            subprocess.run(["node", str(sync)], cwd=ROOT, check=False)
        except OSError:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
