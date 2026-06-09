#!/usr/bin/env python3
"""Remove em dashes across the shipped web app with context-appropriate punctuation.

Each replacement is a distinctive fragment, so the full list can be applied to every
file safely (a no-op where the fragment is absent). A generic safety net converts any
remaining em dash so the build is guaranteed em-dash-free.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

FILES = [
    "index.html",
    "audiences.html",
    "activations.html",
    "library.html",
    "settings.html",
    "upload-csv.html",
    "ui-foundations.html",
    "analyses/index.html",
    "analyses/new.html",
    "analyses/espn-detail.html",
    "chat/index.html",
    "processed-csvs/index.html",
    "assets/js/app.js",
    "assets/css/theme.css",
    "assets/css/ui-foundations.css",
]

REPLACEMENTS = [
    # Shared audience modal helper (appears in many files)
    ("Optional — improves CRS accuracy.", "Optional, improves CRS accuracy."),

    # HTML copy
    ("Completed — inventory curated, campaign plan finalized",
     "Completed: inventory curated, campaign plan finalized"),
    ("relevant audiences — then activate with confidence",
     "relevant audiences, then activate with confidence"),
    ("sign in — Clay-style split card", "sign in, Clay-style split card"),
    ("Exploration only — not saved to your", "Exploration only. Not saved to your"),
    ("CSS files—not just this page", "CSS files, not just this page"),
    ("of examples—not the product UI itself", "of examples, not the product UI itself"),
    ("validation—not for full-page decoration", "validation, not for full-page decoration"),
    ("custom properties—change them in", "custom properties; change them in"),
    ("controls—see", "controls; see"),
    ("prefix—this page does not ship", "prefix; this page does not ship"),
    ("row styling—see", "row styling; see"),
    ("browse — column validation runs before processing",
     "browse. Column validation runs before processing"),
    ("choosing an input type — only", "choosing an input type. Only"),
    ("Step 3 — Review your CRS verdict and evidence",
     "Step 3: Review your CRS verdict and evidence"),
    ("Step 1 — Choose input type", "Step 1: Choose input type"),
    ("Step 2 — Provide input", "Step 2: Provide input"),
    ("are complete — continue to enter DSP details",
     "are complete. Continue to enter DSP details"),

    # app.js copy and assistant replies
    ("save segment — name is missing", "save segment. The name is missing"),
    ("segment not found — it may have been deleted",
     "segment not found. It may have been deleted"),
    ("cultural context — not just demographics", "cultural context, not just demographics"),
    ("(40%) — Does the environment", "(40%): Does the environment"),
    ("(30%) — Mobile patterns", "(30%): Mobile patterns"),
    ("(15%) — Credible voice", "(15%): Credible voice"),
    ("(15%) — Sustained coverage", "(15%): Sustained coverage"),
    ("sports fans — not a general-market", "sports fans, not a general-market"),
    ("sports rituals — scores, highlights, fantasy — match daily",
     "sports rituals (scores, highlights, fantasy) match daily"),
    ("key match windows — not generic team logos",
     "key match windows, not generic team logos"),
    ("* — For this segment, ESPN over-indexes",
     "* For this segment, ESPN over-indexes"),
    ("CRS **82** — strong cultural relevance for",
     "CRS **82**, strong cultural relevance for"),
    ("improving but uneven — note as a watch item",
     "improving but uneven; note as a watch item"),
    ("Heritage-only casting** — Leading with flags",
     "Heritage-only casting**: Leading with flags"),
    ("Single-sport tokenism** — Assuming soccer",
     "Single-sport tokenism**: Assuming soccer"),
    ("bilingual environments** — Friction on publishers",
     "bilingual environments**: Friction on publishers"),
    ("Highlight theft** — Creative that crops",
     "Highlight theft**: Creative that crops"),
    ("Event-only bursts** — World Cup", "Event-only bursts**: World Cup"),
    ("activation steps — all tracked", "activation steps, all tracked"),
    ("Evaluation (CRS 82)** — Activation-ready",
     "Evaluation (CRS 82)**: Activation-ready"),
    ("Summer Brief (CRS 71)** — Strong for Gen Z",
     "Summer Brief (CRS 71)**: Strong for Gen Z"),
    ("Creative Review (CRS 68)** — In review",
     "Creative Review (CRS 68)**: In review"),
    ("Instagram, TikTok — mobile-first highlight consumption",
     "Instagram, TikTok. Mobile-first highlight consumption"),
    ("from your analysis — inventory, campaign plan, or activation — and I can help",
     "from your analysis (inventory, campaign plan, or activation) and I can help"),
    ("** — that creates a saved evaluation",
     "**, which creates a saved evaluation"),
    ("Q&A only — not saved to Analyses", "Q&A only. Not saved to Analyses"),
    ("sports fans — refine, export, or send to DSP",
     "sports fans: refine, export, or send to DSP"),
    ("sports fans — ESPN digital, Spanish-language sports",
     "sports fans: ESPN digital, Spanish-language sports"),
    ("common workflows — each path creates a saved evaluation",
     "common workflows. Each path creates a saved evaluation"),
    ("starting point — domain for publisher evaluation",
     "starting point: domain for publisher evaluation"),
    ("Thank you — your feedback helps improve",
     "Thank you. Your feedback helps improve"),

    # CSS comments
    ("Recent Analyses — neutral row hover", "Recent Analyses: neutral row hover"),
    ("/* ——— Analysis workspace components ——— */",
     "/* Analysis workspace components */"),
    ("Bottom AI dock — persistent FAB", "Bottom AI dock: persistent FAB"),
    ("inside the dock — scroll the thread instead",
     "inside the dock; scroll the thread instead"),
    ("Campaign plan — mix edit sliders", "Campaign plan: mix edit sliders"),
    ("Analysis run — staged loading before opening result",
     "Analysis run: staged loading before opening result"),
    ("stay in theme.css — same SSOT the app loads",
     "stay in theme.css; same SSOT the app loads"),
]


def main():
    leftovers = []
    for rel in FILES:
        path = ROOT / rel
        text = path.read_text(encoding="utf-8")
        original = text
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        # Safety net for anything unforeseen.
        if "\u2014" in text:
            text = text.replace(" \u2014 ", ", ").replace("\u2014", ", ")
        if text != original:
            path.write_text(text, encoding="utf-8")
            print(f"updated {rel}")
        if "\u2014" in text:
            leftovers.append(rel)

    if leftovers:
        print("WARNING: em dashes still present in:", leftovers)
    else:
        print("OK: no em dashes remain in shipped files")


if __name__ == "__main__":
    main()
