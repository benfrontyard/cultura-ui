#!/usr/bin/env python3
"""Insert chUpgradeModal and wire upgrade entry points (except settings.html)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

UPGRADE_MODAL = """    <div class="modal fade" id="chUpgradeModal" tabindex="-1" aria-labelledby="chUpgradeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title ch-type-heading-md" id="chUpgradeModalLabel">Upgrade your plan</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close dialog"></button>
          </div>
          <div class="modal-body">
            <p class="mb-2"><span class="fw-semibold">Free Plan</span></p>
            <p class="small text-ch-secondary mb-3">Upgrade for additional analyses, activations, and team seats.</p>
            <ul class="small text-ch-secondary mb-0 ps-3">
              <li>More analyses per month</li>
              <li>DSP activation push</li>
              <li>Team collaboration seats</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Not now</button>
            <a href="#" class="btn btn-outline-primary" data-ch-plan-details data-bs-dismiss="modal">Plan details</a>
            <button type="button" class="btn btn-primary" data-ch-demo-toast data-ch-toast-message="Opening billing portal…" data-ch-toast-variant="secondary" data-bs-dismiss="modal">Upgrade plan</button>
          </div>
        </div>
      </div>
    </div>

"""

PAGES = [
    "index.html",
    "audiences.html",
    "activations.html",
    "library.html",
    "upload-csv.html",
    "ui-foundations.html",
    "analyses/index.html",
    "analyses/new.html",
    "analyses/espn-detail.html",
    "processed-csvs/index.html",
]

SIDEBAR_OLD = '<a class="btn btn-outline-primary btn-sm w-100" href="'
SIDEBAR_ATTR = ' data-ch-upgrade-open'

DEMO_MODAL_START = '    <div class="modal fade" id="chDemoModal"'
TOAST_HOST = '    <div class="toast-container position-fixed bottom-0 end-0 p-3" id="chToastHost" aria-live="polite"></div>'


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    if "id=\"chUpgradeModal\"" not in text and TOAST_HOST in text:
        text = text.replace(TOAST_HOST, UPGRADE_MODAL + TOAST_HOST, 1)

    if path.name != "settings.html":
        for prefix in ("settings.html#plan", "../settings.html#plan"):
            sidebar_needle = (
                f'<a class="btn btn-outline-primary btn-sm w-100" href="{prefix}">'
            )
            sidebar_repl = (
                f'<a class="btn btn-outline-primary btn-sm w-100" href="{prefix}"{SIDEBAR_ATTR}>'
            )
            if sidebar_needle in text and SIDEBAR_ATTR not in text.split(sidebar_needle)[1].split(">", 1)[0]:
                text = text.replace(sidebar_needle, sidebar_repl)

            menu_needle = f'<li><a class="dropdown-item" href="{prefix}">Upgrade</a></li>'
            menu_repl = (
                f'<li><a class="dropdown-item" href="{prefix}"{SIDEBAR_ATTR}>Upgrade</a></li>'
            )
            text = text.replace(menu_needle, menu_repl)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for rel in PAGES:
        p = ROOT / rel
        if p.exists() and patch_file(p):
            changed.append(rel)
    print("Patched:", ", ".join(changed) if changed else "(none)")


if __name__ == "__main__":
    main()
