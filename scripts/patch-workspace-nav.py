#!/usr/bin/env python3
"""Patch sidebar nav, remove dev-only UI Foundations link, fix upgrade/settings links."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP = {"crs-reports.html", "ai-chat.html", "persona-detail.html"}

DEV_NAV = re.compile(
    r"\n\s*<li class=\"ch-dev-only-nav d-none\">.*?</li>",
    re.DOTALL,
)

PALETTE_UPLOAD = re.compile(
    r'\s*<a href="[^"]*upload-csv\.html#upload-zone"[^>]*>Audience signals CSV upload</a>\n'
    r'\s*<a href="[^"]*processed-csvs/index\.html"[^>]*>Processed audience data</a>\n',
)


def rel_prefix(path: Path) -> str:
    depth = len(path.relative_to(ROOT).parts) - 1
    return "../" * depth


def patch_palette(text: str, p: str) -> str:
    if "data-ch-palette-label=\"activations campaigns" in text:
        return text
    block = (
        f'              <a href="{p}activations.html" class="list-group-item list-group-item-action" '
        f'data-ch-palette-label="activations campaigns dsp deals">Activations</a>\n'
        f'              <a href="{p}library.html" class="list-group-item list-group-item-action" '
        f'data-ch-palette-label="library files uploads blueprints assets">Library</a>\n'
        f'              <a href="{p}settings.html" class="list-group-item list-group-item-action" '
        f'data-ch-palette-label="settings account plan preferences">Settings</a>\n'
    )
    needle = 'data-ch-palette-label="new analysis create start">New Analysis</a>\n'
    if needle in text:
        return text.replace(needle, needle + block)
    return text


def patch_file(path: Path) -> None:
    if path.name in SKIP:
        return
    p = rel_prefix(path)
    text = path.read_text(encoding="utf-8")
    original = text

    text = DEV_NAV.sub("\n", text)

    text = text.replace(
        'href="#" data-ch-nav="activations"',
        f'href="{p}activations.html" data-ch-nav="activations"',
    )
    text = text.replace(
        'href="#" data-ch-nav="library"',
        f'href="{p}library.html" data-ch-nav="library"',
    )
    text = text.replace(
        'href="#" data-ch-nav="settings"',
        f'href="{p}settings.html" data-ch-nav="settings"',
    )

    text = re.sub(
        r'(<a class="btn btn-outline-primary btn-sm w-100" href=")(?:\.\./)*ui-foundations\.html(">)',
        rf"\1{p}settings.html#plan\2",
        text,
    )
    text = re.sub(
        r'(<li><a class="dropdown-item" href=")(?:\.\./)*ui-foundations\.html(">Upgrade</a></li>)',
        rf'\1{p}settings.html#plan\2',
        text,
    )

    text = patch_palette(text, p)

    if PALETTE_UPLOAD.search(text):
        text = PALETTE_UPLOAD.sub(
            f'\n              <a href="{p}library.html" class="list-group-item list-group-item-action" '
            f'data-ch-palette-label="library files csv uploads processed data">Library (files &amp; data)</a>\n',
            text,
            count=1,
        )

    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"patched {path.relative_to(ROOT)}")


def main() -> int:
    for html in sorted(ROOT.rglob("*.html")):
        patch_file(html)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
