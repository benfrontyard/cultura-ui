#!/usr/bin/env python3
"""Align Streamline icon <use> refs with semantic context across HTML shells."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

NAV_AUDIENCES_RE = re.compile(
    r'(<use href="#)ch-list-ul("/></svg>\s*<span class="ch-nav-label">Audiences</span>)'
)
NAV_ACTIVATIONS_RE = re.compile(
    r'(<use href="#)ch-send("/></svg>\s*<span class="ch-nav-label">Activations</span>)'
)

FILE_REPLACEMENTS = [
    # Dashboard quick start
    (
        "index.html",
        '<use href="#ch-diagram"/></svg>\n                          <div class="fw-semibold text-body">Analyze a domain</div>',
        '<use href="#ch-globe"/></svg>\n                          <div class="fw-semibold text-body">Analyze a domain</div>',
    ),
    (
        "index.html",
        '<use href="#ch-eye"/></svg>\n                          <div class="fw-semibold text-body">Evaluate creative</div>',
        '<use href="#ch-view"/></svg>\n                          <div class="fw-semibold text-body">Evaluate creative</div>',
    ),
    # Library cards
    (
        "library.html",
        '<use href="#ch-cloud-upload"/></svg>\n                        <div class="fw-semibold text-body">Audience signals</div>',
        '<use href="#ch-people"/></svg>\n                        <div class="fw-semibold text-body">Audience signals</div>',
    ),
    (
        "library.html",
        '<use href="#ch-file-csv"/></svg>\n                        <div class="fw-semibold text-body">Processed data</div>',
        '<use href="#ch-file-stack"/></svg>\n                        <div class="fw-semibold text-body">Processed data</div>',
    ),
    (
        "library.html",
        '<use href="#ch-file-earmark"/></svg>\n                        <div class="fw-semibold text-body">Blueprints &amp; exports</div>',
        '<use href="#ch-export"/></svg>\n                        <div class="fw-semibold text-body">Blueprints &amp; exports</div>',
    ),
    # New analysis dropzones
    (
        "analyses/new.html",
        '<use href="#ch-cloud-upload"/></svg>\n                          <p class="fw-semibold mb-1">Drag and drop creative assets</p>',
        '<use href="#ch-view"/></svg>\n                          <p class="fw-semibold mb-1">Drag and drop creative assets</p>',
    ),
    # Activation checklist
    (
        "analyses/espn-detail.html",
        '<svg class="ch-icon" aria-hidden="true" focusable="false"><use href="#ch-send"/></svg> Submit (locked)',
        '<svg class="ch-icon" aria-hidden="true" focusable="false"><use href="#ch-lock"/></svg> Submit (locked)',
    ),
]


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    text = NAV_AUDIENCES_RE.sub(r"\1ch-people\2", text)
    text = NAV_ACTIVATIONS_RE.sub(r"\1ch-rocket\2", text)

    rel = path.relative_to(ROOT).as_posix()
    for file_name, old, new in FILE_REPLACEMENTS:
        if rel == file_name:
            text = text.replace(old, new)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        if patch_file(path):
            print(f"patched {path.relative_to(ROOT)}")
            changed += 1
    print(f"Done. {changed} file(s) updated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
