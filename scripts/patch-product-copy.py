#!/usr/bin/env python3
"""Bulk product-copy patches across duplicated HTML shell."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP = {"crs-reports.html", "ai-chat.html", "persona-detail.html"}

CAMPAIGN_SHORT = (
    '            <p class="mb-0">Campaign planning and flighting tools are not available in this preview workspace.</p>\n'
    "          </div>\n"
    '          <div class="modal-footer">\n'
    '            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Done</button>'
)

CAMPAIGN_UNIFIED = """            <p class="mb-3">Plan geo mix, platform mix, and budget from the Campaign Plan tab on any completed analysis.</p>
            <a href="{p}analyses/espn-detail.html#tab-campaign-plan" class="btn btn-primary">Open Campaign Plan</a>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>"""

CAMPAIGN_LONG_RE = re.compile(
    r'<p class="mb-3">Full campaign flighting tools are not in this preview\. Open an analysis to review geo mix, platform mix, and budget options on the Campaign Plan tab\.</p>\s*'
    r'<a href="[^"]*espn-detail\.html#tab-campaign-plan"[^>]*>Open Campaign Plan</a>',
    re.DOTALL,
)

HELP_OLD = """            <ul class="mb-0">
              <li>
                <a href="https://theculturehive.ai" rel="noopener noreferrer" target="_blank"
                  >Culture Hive<span class="visually-hidden"> (opens in new tab)</span></a
                >
              </li>
              <li class="text-ch-secondary small">Product documentation is not linked in this preview build.</li>
            </ul>"""

HELP_NEW = """            <ul class="mb-0">
              <li class="mb-2">
                <a href="https://theculturehive.ai" rel="noopener noreferrer" target="_blank"
                  >Culture Hive<span class="visually-hidden"> (opens in new tab)</span></a
                >
              </li>
              <li>
                <a href="https://theculturehive.ai" rel="noopener noreferrer" target="_blank"
                  >Help center<span class="visually-hidden"> (opens in new tab)</span></a
                >
              </li>
            </ul>"""

DEMO_OLD = (
    "In production, choose an audience lens and blueprint template here. "
    "This preview uses static copy only."
)

DEMO_NEW = (
    "Choose an audience lens and blueprint template to shape your analysis. "
    "Templates pre-fill audience context and strategic recommendations."
)

AUDIENCE_HELPER = (
    '          <div class="modal-body">\n'
    '            <label for="chAudienceSearch"'
)

AUDIENCE_HELPER_WITH = (
    '          <div class="modal-body">\n'
    '            <p class="small text-ch-muted mb-3">Optional — improves CRS accuracy.</p>\n'
    '            <label for="chAudienceSearch"'
)

PALETTE_FOOTER_OLD = (
    '<p class="small text-ch-muted mb-0 mt-3">Choose a destination or press Escape to close.</p>'
)
PALETTE_FOOTER_NEW = (
    '<p class="small text-ch-muted mb-0 mt-3">Type to filter pages and actions.</p>'
)


def rel_prefix(path: Path) -> str:
    depth = len(path.relative_to(ROOT).parts) - 1
    return "../" * depth


def patch_file(path: Path) -> None:
    if path.name in SKIP:
        return
    p = rel_prefix(path)
    text = path.read_text(encoding="utf-8")
    original = text

    text = text.replace(" · Culture Hive AI</title>", " · Culture Hive</title>")

    text = text.replace('alt="Cultura"', 'alt="Culture Hive"')
    text = text.replace('alt="Cultura by Culture Hive"', 'alt="Culture Hive"')

    text = text.replace(">Ask AI</button>", ">Ask Cultura AI</button>")
    text = text.replace(">Ask AI about this</button>", ">Ask Cultura AI about this</button>")

    if CAMPAIGN_SHORT in text:
        text = text.replace(CAMPAIGN_SHORT, CAMPAIGN_UNIFIED.format(p=p))

    if CAMPAIGN_LONG_RE.search(text):
        text = CAMPAIGN_LONG_RE.sub(
            CAMPAIGN_UNIFIED.format(p=p).split("\n          <div class=\"modal-footer\">")[0],
            text,
            count=1,
        )
        text = text.replace(
            '<div class="modal-footer">\n            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>',
            '<div class="modal-footer">\n            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>',
            1,
        )

    text = text.replace(HELP_OLD, HELP_NEW)

    text = text.replace(
        '<li class="text-ch-secondary small">Product documentation is not linked in this preview build.</li>',
        "",
    )
    text = text.replace(
        '<li class="text-ch-secondary small">Release notes are not linked in this preview build.</li>',
        "",
    )

    text = text.replace(DEMO_OLD, DEMO_NEW)

    if AUDIENCE_HELPER in text and AUDIENCE_HELPER_WITH not in text:
        text = text.replace(AUDIENCE_HELPER, AUDIENCE_HELPER_WITH, 1)

    text = text.replace(PALETTE_FOOTER_OLD, PALETTE_FOOTER_NEW)

    text = text.replace('placeholder="Ask Culture Hive AI…"', 'placeholder="Ask Cultura AI…"')

    text = text.replace(
        'data-ch-toast-message="Billing is not connected in this preview."',
        'data-ch-toast-message="Opening billing portal…"',
    )

    text = text.replace(
        "Notification preferences are not configurable in this preview.",
        "Get notified when an analysis is ready to activate.",
    )

    text = text.replace(
        "Saved to this browser only in the preview. Culture Hive catalog segments cannot be edited here.",
        "Saved to your workspace. Culture Hive catalog segments cannot be edited here.",
    )

    text = text.replace(
        "Review staged files feeding cultural blueprints and segment analysis. Filter and sort below; actions are static in this preview.",
        "Review staged files feeding analyses and audience segments. Filter and sort below.",
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
