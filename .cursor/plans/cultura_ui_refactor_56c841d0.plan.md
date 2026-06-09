---
name: Cultura UI Refactor
overview: Refactor the Cultura prototype from disconnected tool pages into a cohesive B2B SaaS workspace organized around an "Analysis" object, with a proper dashboard, new analysis flow, Analysis Detail page with 7 tabs, contextual AI copilot drawer, and improved visual system — all as a static clickable prototype using the existing Bootstrap 5 + jQuery + theme.css stack.
todos:
  - id: css-additions
    content: Append new component CSS to assets/css/theme.css (CRS score, analysis header, budget cards, geo bars, copilot drawer, input type cards, stat cards)
    status: pending
  - id: nav-update
    content: "Update sidebar nav block in all HTML files: index.html, crs-reports.html, persona-detail.html, audiences.html, upload-csv.html — replace with new nav items (Dashboard, Analyses, Audiences, Activations, Library, Settings)"
    status: pending
  - id: dashboard-rewrite
    content: "Rewrite index.html main content: hero header + New Analysis CTA, 4 KPI stat cards, Recent Analyses list, Quick Start cards, remove inline AI as primary action"
    status: pending
  - id: analysis-detail
    content: "Create analyses/espn-detail.html: analysis header with CRS score card, 7-tab nav (Overview/Audience/Inventory/Blueprint/Campaign Plan/Activation/History), full tab content, Deal ID modal, AI copilot offcanvas drawer"
    status: pending
  - id: new-analysis-flow
    content: "Create analyses/new.html: 2-step flow with 5 input type selection cards and dynamic form per type, routes to espn-detail.html on submit"
    status: pending
  - id: analyses-list
    content: "Create analyses/index.html: analyses list table with ESPN.com Evaluation, Nike Summer Brief, Tubi Creative Review rows, New Analysis primary CTA, filter/search bar"
    status: pending
  - id: js-additions
    content: "Append new JS to assets/js/app.js: initAnalysisDetail(), initNewAnalysis(), renderCopilotSuggestions(), tab-aware copilot, routing actions, mock toast handlers"
    status: pending
isProject: false
---

# Cultura UI Refactor — Implementation Plan

## Current Stack (do not change)
- Bootstrap 5.3, jQuery, custom `assets/css/theme.css` (3,081 lines), `assets/js/app.js` (1,160 lines)
- Icon sprite injected via `assets/js/ch-icon-sprite-inject.js`
- Static HTML files, no build step, deployed to GitHub Pages

## Existing assets to reuse
- `ch-card` / `ch-card-body` — card pattern
- `ch-pill`, `ch-pill-success`, `ch-pill-warning`, `ch-pill-neutral` — status badges
- `ch-table` — table styles
- `nav-tabs` + `tab-pane` — Bootstrap tab pattern (already in `persona-detail.html`)
- `offcanvas` — Bootstrap slide-over (already used for mobile nav + history drawer)
- `showToast()` in `app.js` — toast notifications
- `ch-suggested-prompt` — prompt chip buttons (in `chat/index.html`)
- `data-ch-nav` active state system
- Sidebar collapse + localStorage persistence
- `#chAudienceModal` — audience picker modal
- CSS tokens: `--ch-blue-*`, `--ch-primary`, `--ch-border`, `--ch-semantic-success-*`, etc.

## New File Map

```
analyses/
  index.html          ← Analyses list (replaces crs-reports.html role)
  new.html            ← New Analysis 2-step flow
  espn-detail.html    ← Analysis Detail with 7 tabs (primary deliverable)
index.html            ← Dashboard rewrite (content only, shell stays)
assets/css/theme.css  ← ~150 lines of new component CSS appended
assets/js/app.js      ← ~120 lines of new interaction logic appended
```

Existing files (`crs-reports.html`, `persona-detail.html`, `audiences.html`) remain untouched — content from them is reused in the new tab pages.

## Navigation Change (all HTML files)

Current sidebar: `Home → Assistant → Reports → Personas → Audiences → Files`

New sidebar:
```
Dashboard        data-ch-nav="home"
Analyses         data-ch-nav="analyses"       → analyses/index.html
Audiences        data-ch-nav="audiences"      → audiences.html (unchanged)
Activations      data-ch-nav="activations"    → placeholder stub
Library          data-ch-nav="library"        → placeholder stub
Settings         data-ch-nav="settings"       → placeholder stub
```

The sidebar block is duplicated in every HTML file. Update all copies.

## Page 1: Dashboard (`index.html`)

Replace `<main>` content. Keep shell (`ch-sidebar`, `ch-topbar`, offcanvas components) identical.

New main content:
- Header: "Cultural Intelligence Workspace" h1, subtext, "New Analysis" primary btn → `analyses/new.html`, "View Analyses" outline btn → `analyses/index.html`
- KPI stat row: 4 `ch-card` cards — Analyses Created (12), Avg. CRS (74), Active Segments (6), Activation-ready (3)
- Recent Analyses: `ch-card` with 3 rows — ESPN.com Evaluation, Nike Summer Brief, Tubi Creative Review — each row links to `analyses/espn-detail.html`
- Quick Start cards: 4-column grid — "Analyze a domain", "Upload a brief", "Evaluate creative", "Build from audience" — all link to `analyses/new.html`
- Remove inline AI assistant panel from primary position (keep as collapsed hint or remove entirely)

## Page 2: New Analysis (`analyses/new.html`)

Two-step JS flow (no page navigation between steps):

**Step 1** — Input type picker:
- 5 selection cards in a CSS grid: Domain, App/Bundle ID, Campaign Brief, Creative Asset, Audience Idea
- Clicking a card adds `aria-selected="true"` + visual active border, reveals Step 2
- Use `ch-card` with `cursor: pointer` and `:has(input:checked)` pattern for selection state

**Step 2** — Dynamic input form (shown below the card grid after selection):
- Domain variant: text input + optional audience picker + "Generate Analysis" btn → `espn-detail.html`
- Brief/Creative variant: dropzone (existing `data-ch-dropzone` pattern) + notes textarea + submit btn
- Audience variant: text input + "Generate Analysis" btn
- The audience picker reuses `#chAudienceModal` pattern

## Page 3: Analysis Detail (`analyses/espn-detail.html`) — Primary Deliverable

### Header (above tabs)
```
Breadcrumb: Analyses / ESPN.com Evaluation
Title: ESPN.com Evaluation                    [Export] [Share] [Create Activation]
Meta: Domain · www.espn.com · Latino Millennial Sports Fans · [Completed] · Jun 4, 2026
CRS Score card: large "82" · "Strong cultural relevance" · subtext tagline
```

CRS score uses new `.ch-crs-score` component (see CSS section).

### Tab nav (Bootstrap `nav-tabs`)
`Overview | Audience | Inventory | Blueprint | Campaign Plan | Activation | History`

### Overview tab
- Score Summary card: CRS 82, audience, suggested action, impact potential
- Evidence cards (2×2 grid): Audience Alignment (32/40), Ownership & Authenticity (20/25), Editorial/UX Signals (18/25), Intersectional Representation (12/10) — each with short rationale + "View evidence" ghost btn
- Recommended Next Actions: 5 action cards — "Review audience persona" → activates Audience tab, "Curate inventory" → Inventory tab, etc.
- AI prompt chips row: "Explain why this scored 82", "How can this score improve?", "Summarize for a client", "Compare against another domain" — clicking opens copilot drawer + pre-fills input

### Audience tab
Content migrated from `persona-detail.html` (Urban Wellness → Diego Ramirez persona):
- Primary Segment card: Diego Ramirez, 25–34, Latino Millennial
- Cultural Identity badges: existing `badge rounded-pill` pattern
- 3-column card row: Core Interests, Behavioral Traits, Preferred Platforms
- Creative Alignment Notes card
- Sample Targeting Filters card (display-only filter chips)
- "Save Audience Segment" btn → `showToast("Audience segment saved.", "success")`

### Inventory tab
- Summary bar: "13 of 50,000 domains" + filter chips (Included · Sports · Spanish-language · High cultural fit)
- `ch-table` with columns: Domain, Reason Included, Cultural Fit score badge, Include toggle (`form-switch`)
- 13 rows: espn.com, univision.com, mlb.com, nba.com, telemundo.com, bleacherreport.com, futbolarena.com, sbnation.com, latinosports.com, foxsports.com, espndeportes.com, soccerwire.com, theathletic.com
- Below table: "Export CSV" ghost btn → toast, "Create Deal ID" outline btn → opens `#chDealModal`, "Send to DSP" primary btn → toast

### Blueprint tab
7 `ch-card` sections in report layout: Brand Overview, Audience Snapshot, Values (badge chips), Media Habits, Psychographics, Why It Matters, Strategic Recommendations
- Actions: "Download PDF" → toast, "Share Blueprint" → toast, "Generate Client Summary" → toast

### Campaign Plan tab
- Campaign objective card
- KPIs card: CTR, Engagement Rate, Sentiment Lift, Time on Site — as `badge` chips
- Geo Mix card: 5 rows, each with label, percentage, and CSS width bar (`ch-geo-bar` / `ch-geo-bar__fill`)
- Platform Mix card: same pattern — Mobile Web 40%, CTV 30%, Display 20%, Social 10%
- Budget options: 3 radio cards (existing `:has(input:checked)` pattern) — $2k/1.2M reach, $5k/3.1M reach, $9k/5.6M reach
- Below: "Customize Plan" secondary btn (toggle editable state), "Create Activation" primary btn → activates Activation tab via `bootstrap.Tab.getOrCreateInstance()`

### Activation tab
- Status card: "Not activated — Ready for DSP setup" with warning badge
- Step list (4 items): Review inventory ✓, Confirm platform mix ✓, Enter DSP details (empty), Submit (locked)
- "Create Deal ID" primary btn → opens `#chDealModal`

### History tab
- Placeholder card: "Analysis snapshots and version history coming soon."

### Deal ID Modal (`#chDealModal`)
```
Title: "Create DSP Deal"
Subtext: "Send the selected audience and inventory package to your preferred DSP..."
Fields: First Name, Last Name, Company, Email, Preferred SSP, Preferred DSP, DSP Seat ID, Notes (optional)
Submit: "Create Deal & Send to DSP" → showToast("Deal created. Confirmation sent.", "success") + modal dismiss
```

### AI Copilot Drawer
Bootstrap `offcanvas offcanvas-end`, width 360px, ID `#chCopilotDrawer`:
- Context label: "Using ESPN.com Analysis"
- Suggested prompts section — tab-aware (JS swaps content on `shown.bs.tab`)
- `ch-ai-prompt` textarea + send button (existing pattern from `chat/index.html`)
- Chat thread `role="log"` with mock response on send

Trigger: "Ask AI" button in the analysis header area + prompt chips on Overview tab.

## CSS additions (`assets/css/theme.css`, append only)

```css
/* CRS Score badge */
.ch-crs-score { display: flex; align-items: center; gap: 1rem; }
.ch-crs-score__number { font-size: 2.5rem; font-weight: 700; color: var(--ch-semantic-success-text); line-height: 1; }
.ch-crs-score__label { font-size: 0.875rem; color: var(--ch-text-secondary); }
.ch-crs-score__bar { height: 4px; border-radius: 2px; background: var(--ch-semantic-success-border); width: 100%; margin-top: 0.25rem; }
.ch-crs-score__bar-fill { height: 100%; border-radius: 2px; background: var(--ch-semantic-success-text); width: 82%; }

/* Analysis header */
.ch-analysis-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--ch-border); background: var(--ch-surface); }
.ch-analysis-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; font-size: 0.875rem; color: var(--ch-text-secondary); }

/* Budget radio cards */
.ch-budget-card { border: 2px solid var(--ch-border); border-radius: 0.5rem; padding: 1rem; cursor: pointer; transition: border-color 0.15s; }
.ch-budget-card:has(input:checked) { border-color: var(--ch-primary); background: var(--ch-blue-50); }

/* Geo/Platform bar */
.ch-metric-bar { height: 6px; border-radius: 3px; background: var(--ch-neutral-100); overflow: hidden; }
.ch-metric-bar__fill { height: 100%; border-radius: 3px; background: var(--ch-primary); }

/* Copilot drawer */
.ch-copilot-drawer { width: 360px; }
.ch-copilot-context-pill { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: var(--ch-text-muted); background: var(--ch-neutral-100); border-radius: 999px; padding: 0.25rem 0.625rem; }

/* Input type selection cards */
.ch-input-type-card { border: 2px solid var(--ch-border); border-radius: 0.75rem; padding: 1.25rem; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; }
.ch-input-type-card:hover { border-color: var(--ch-blue-300); box-shadow: 0 0 0 3px var(--ch-blue-100); }
.ch-input-type-card.selected { border-color: var(--ch-primary); background: var(--ch-blue-50); }
.ch-input-type-card input[type="radio"] { position: absolute; opacity: 0; width: 0; height: 0; }

/* Evidence cards */
.ch-evidence-card__score { font-size: 1.375rem; font-weight: 700; color: var(--ch-primary); }

/* Quick stat cards */
.ch-stat-card__value { font-size: 2rem; font-weight: 700; color: var(--ch-heading); }
.ch-stat-card__label { font-size: 0.8125rem; color: var(--ch-text-muted); }
```

## JS additions (`assets/js/app.js`, append inside IIFE)

```javascript
// Analysis Detail page behaviors
function initAnalysisDetail() {
  if (!$('#analyses-espn-detail').length) return;  // guard

  // Tab-aware copilot suggestions
  var copilotSuggestions = {
    '#tab-overview':      ['Explain why this scored 82','What would improve the score?','Summarize for a client','What are the top risks?'],
    '#tab-audience':      ['Turn this persona into targeting criteria','What creative tone would resonate?','What stereotypes should we avoid?'],
    '#tab-inventory':     ['Why was this domain included?','Find more Spanish-language sports inventory','Exclude general-market domains'],
    '#tab-blueprint':     ['Summarize this blueprint in 3 bullets','What cultural tensions should we be aware of?'],
    '#tab-campaign-plan': ['Recommend a lower-budget version','Adjust this for awareness','Rewrite this for a media buyer'],
    '#tab-activation':    ['What DSPs work best for this audience?','Estimate reach for $5k/week']
  };
  $('[data-bs-toggle="tab"]').on('shown.bs.tab', function(e) {
    var target = $(e.target).attr('data-bs-target');
    var prompts = copilotSuggestions[target] || [];
    renderCopilotSuggestions(prompts);
  });

  // Prompt chips → open copilot + pre-fill
  $(document).on('click', '[data-ch-copilot-prompt]', function() {
    var prompt = $(this).attr('data-ch-copilot-prompt');
    bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('chCopilotDrawer')).show();
    setTimeout(function() { $('#chCopilotInput').val(prompt).trigger('input'); }, 300);
  });

  // "Create Activation" → activate Activation tab
  $(document).on('click', '[data-ch-goto-activation]', function() {
    bootstrap.Tab.getOrCreateInstance(document.querySelector('#tab-activation-tab')).show();
    document.querySelector('#tab-activation').scrollIntoView({ behavior: 'smooth' });
  });

  // Deal modal submit
  $(document).on('click', '#chDealSubmit', function() {
    bootstrap.Modal.getInstance(document.getElementById('chDealModal')).hide();
    showToast('Deal created. Confirmation sent to your DSP.', 'success');
  });

  // Inventory toggle counter
  $(document).on('change', '.ch-inventory-toggle', function() {
    var count = $('.ch-inventory-toggle:checked').length;
    $('#chInventoryCount').text(count + ' of 13 selected');
  });

  // Save audience segment
  $(document).on('click', '[data-ch-save-audience]', function() {
    showToast('Audience segment saved to your workspace.', 'success');
  });

  // Export / Share mock toasts
  $(document).on('click', '[data-ch-export]', function() { showToast('Export ready.', 'secondary'); });
  $(document).on('click', '[data-ch-share]', function() { showToast('Share link copied.', 'secondary'); });
  $(document).on('click', '[data-ch-download-pdf]', function() { showToast('Blueprint PDF downloaded.', 'secondary'); });
}

function renderCopilotSuggestions(prompts) {
  var $list = $('#chCopilotSuggestions');
  $list.empty();
  prompts.forEach(function(p) {
    $list.append('<button type="button" class="ch-suggested-prompt w-100 text-start mb-1" data-ch-copilot-prompt="' + p + '">' + p + '</button>');
  });
}

// New Analysis step flow
function initNewAnalysis() {
  if (!$('#page-new-analysis').length) return;
  $(document).on('click', '.ch-input-type-card', function() {
    $('.ch-input-type-card').removeClass('selected');
    $(this).addClass('selected');
    var type = $(this).attr('data-ch-input-type');
    $('.ch-analysis-form-step').addClass('d-none');
    $('#ch-form-' + type).removeClass('d-none');
  });
}
```

## Prototype Routing Map

```
Dashboard "New Analysis" btn         → analyses/new.html
New Analysis "Generate Analysis" btn → analyses/espn-detail.html
Analyses list row click              → analyses/espn-detail.html
Overview action card "Review Audience" → Audience tab (JS tab activation)
Overview action card "Curate Inventory" → Inventory tab
Inventory "Create Deal ID" btn       → #chDealModal opens
Campaign Plan "Create Activation" btn → Activation tab (JS)
Activation "Create Deal ID" btn      → #chDealModal opens
Deal modal submit                    → success toast + modal closes
AI prompt chip (any tab)             → opens copilot drawer + pre-fills input
Tab switch                           → copilot suggestions update
"Save Audience Segment"              → toast
"Export" / "Share" / "Download PDF"  → toast
```

## Implementation Order

1. Append new CSS to `assets/css/theme.css`
2. Update sidebar nav in all existing HTML files (nav block copy-paste update)
3. Rewrite `index.html` main content (dashboard)
4. Create `analyses/espn-detail.html` (largest file, highest value)
5. Create `analyses/new.html`
6. Create `analyses/index.html`
7. Append new JS to `assets/js/app.js`
