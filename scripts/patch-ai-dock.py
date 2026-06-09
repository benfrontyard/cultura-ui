#!/usr/bin/env python3
"""Bottom AI dock — workspace command bar aligned with ch-ai-prompt patterns."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP = {"ai-chat.html", "crs-reports.html", "persona-detail.html"}

SEARCH_WRAP = re.compile(
    r'\n\s*<div class="ch-topbar-search-wrap[^"]*"[^>]*>.*?</div>\n\s*</div>',
    re.DOTALL,
)

OLD_JUMP_BTN = re.compile(
    r'\n\s*<button\s*\n\s*type="button"\s*\n\s*class="btn btn-light border d-md-none flex-shrink-0"\s*\n\s*data-ch-command-palette-open[^>]*>\s*\n\s*<svg class="ch-icon"[^>]*><use href="#ch-search"/></svg>\s*\n\s*</button>',
    re.DOTALL,
)

ASK_AI_TOPBAR = re.compile(
    r'\n\s*<button\s*\n\s*type="button"\s*\n\s*class="btn btn-light border btn-sm d-none d-md-inline-flex flex-shrink-0"\s*\n\s*data-bs-toggle="offcanvas"\s*\n\s*data-bs-target="#chCopilotDrawer"\s*\n\s*aria-controls="chCopilotDrawer"\s*\n\s*>Ask AI</button>',
    re.DOTALL,
)

COPILOT_DRAWER = re.compile(
    r'\n\s*<div class="offcanvas offcanvas-end ch-copilot-drawer"[^>]*id="chCopilotDrawer"[^>]*>\s*'
    r'<div class="offcanvas-header border-bottom">.*?</div>\s*'
    r'<div class="offcanvas-body d-flex flex-column">.*?</div>\s*'
    r"</div>",
    re.DOTALL,
)

ORPHAN_COPILOT = re.compile(
    r'\n\s*<div id="chCopilotThread" class="ch-chat-scroll flex-grow-1 mb-3 border rounded p-2"[^>]*></div>\s*'
    r'<div class="ch-ai-prompt mt-auto">.*?</div>\s*\n\s*</div>\s*\n\s*</div>\n',
    re.DOTALL,
)

ESPN_ASK_AI = re.compile(
    r'<button type="button" class="btn btn-outline-secondary btn-sm" data-bs-toggle="offcanvas" data-bs-target="#chCopilotDrawer" aria-controls="chCopilotDrawer">Ask AI</button>',
)

JUMP_BTN = """            <button
              type="button"
              class="btn btn-light border flex-shrink-0 ch-topbar-jump-btn"
              data-ch-command-palette-open
              aria-haspopup="dialog"
              aria-controls="chCommandPalette"
              aria-label="Jump to page (Command K)"
              title="Jump to page (⌘K)"
            >
              <svg class="ch-icon" aria-hidden="true" focusable="false"><use href="#ch-search"/></svg>
              <span class="ch-topbar-jump-label d-none d-lg-inline">Jump to…</span>
              <span
                class="ch-kbd-hint d-none d-xl-inline-flex ms-1"
                role="group"
                aria-label="Keyboard shortcut: Control or Command K"
                ><kbd>Cmd</kbd><span class="ch-kbd-sep" aria-hidden="true">+</span><kbd>K</kbd></span
              >
            </button>"""


def ai_dock_html() -> str:
    return """
    <div
      id="chAiDock"
      class="ch-ai-dock ch-ai-dock--collapsed"
      role="region"
      aria-label="Cultura AI"
      aria-expanded="false"
    >
      <div class="ch-ai-dock__panel">
        <div id="chCopilotThread" class="ch-ai-dock__thread ch-chat-scroll" role="log" aria-live="polite" hidden></div>
        <div class="ch-ai-prompt ch-ai-dock__composer">
          <button type="button" class="ch-ai-dock__collapse btn btn-icon" data-ch-ai-dock-collapse aria-label="Minimize">
            <svg class="ch-icon ch-icon--sm" aria-hidden="true" focusable="false"><use href="#ch-chevron-down"/></svg>
          </button>
          <div id="chCopilotSuggestions" class="ch-ai-dock__pills"></div>
          <button type="button" class="ch-ai-dock__trigger" data-ch-ai-dock-expand>
            <span class="text-ch-secondary" data-ch-ai-dock-trigger-text>Enter a domain for CRS evaluation…</span>
          </button>
          <div class="ch-ai-dock__body">
            <div class="ch-ai-dock__intent-row" data-ch-ai-dock-intent-row hidden role="group" aria-label="Choose input type">
              <button type="button" class="ch-ai-dock__intent ch-ai-dock__intent--active" data-ch-ai-dock-intent="domain" aria-pressed="true">Domain</button>
              <button type="button" class="ch-ai-dock__intent" data-ch-ai-dock-intent="bundle" aria-pressed="false">Bundle ID</button>
              <button type="button" class="ch-ai-dock__intent" data-ch-ai-dock-intent="brief" aria-pressed="false">Brief</button>
              <button type="button" class="ch-ai-dock__intent" data-ch-ai-dock-intent="creative" aria-pressed="false">Creative</button>
              <button type="button" class="ch-ai-dock__intent" data-ch-ai-dock-intent="audience" aria-pressed="false">Audience</button>
            </div>
            <div class="ch-ai-dock__input-row">
              <label for="chCopilotInput" class="visually-hidden">Ask Cultura AI</label>
              <input
                type="text"
                id="chCopilotInput"
                class="form-control"
                maxlength="2000"
                autocomplete="off"
                placeholder="Enter domain (www.domain.com) for CRS evaluation"
              />
              <button type="button" id="chCopilotAnalyze" class="btn btn-primary btn-sm flex-shrink-0" disabled>Analyze</button>
            </div>
            <div class="ch-ai-dock__attachments" data-ch-ai-dock-attachments hidden>
              <input type="file" id="chAiDockBrief" class="visually-hidden" accept=".pdf,application/pdf" />
              <input type="file" id="chAiDockCreative" class="visually-hidden" accept=".jpg,.jpeg,.png,image/jpeg,image/png" />
              <button type="button" class="ch-ai-dock__attach btn btn-light btn-sm" data-ch-ai-dock-brief-trigger>
                <svg class="ch-icon ch-icon--sm" aria-hidden="true" focusable="false"><use href="#ch-file-earmark"/></svg>
                Brief <span class="text-ch-muted">(.pdf)</span>
              </button>
              <button type="button" class="ch-ai-dock__attach btn btn-light btn-sm" data-ch-ai-dock-creative-trigger>
                <svg class="ch-icon ch-icon--sm" aria-hidden="true" focusable="false"><use href="#ch-upload"/></svg>
                Creative <span class="text-ch-muted">(.jpg, .png)</span>
              </button>
              <span class="ch-ai-dock__file-name small text-ch-muted d-none" data-ch-ai-dock-file-label></span>
              <button type="button" class="btn btn-link btn-sm text-ch-muted p-0 d-none" data-ch-ai-dock-file-clear>Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
"""


def replace_ai_dock(text: str) -> str:
    marker = 'id="chAiDock"'
    if marker not in text:
        return text
    div_start = text.rfind("<div", 0, text.find(marker))
    end_marker = '\n    <div class="toast-container'
    end = text.find(end_marker, div_start)
    if div_start == -1 or end == -1:
        return text
    return text[:div_start] + ai_dock_html() + text[end:]


def patch_topbar(text: str) -> str:
    if "ch-topbar-jump-btn" in text:
        return text
    text = SEARCH_WRAP.sub("", text, count=1)
    text = OLD_JUMP_BTN.sub("\n" + JUMP_BTN, text, count=1)
    text = ASK_AI_TOPBAR.sub("", text)
    return text


def patch_file(path: Path) -> None:
    if path.name in SKIP:
        return
    text = path.read_text(encoding="utf-8")
    original = text

    text = patch_topbar(text)

    if 'id="chCopilotDrawer"' in text:
        text = COPILOT_DRAWER.sub(ai_dock_html(), text, count=1)
    elif 'id="chAiDock"' in text:
        text = replace_ai_dock(text)

    text = ORPHAN_COPILOT.sub("\n", text)

    text = text.replace(
        "      </div>\n\n    <div class=\"toast-container",
        "      </div>\n    </div>\n\n    <div class=\"toast-container",
    )

    if path.name == "espn-detail.html":
        text = ESPN_ASK_AI.sub(
            '<button type="button" class="btn btn-outline-secondary btn-sm" data-ch-ai-dock-open>Ask AI</button>',
            text,
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
