# Cultura UX Audit Checklist

**Purpose:** Page-by-page review of workflow clarity, AI placement, search/navigation, and “what to do next” guidance.

**Product north star** (from `cultura-product-ia.mdc`):
- Core object = **Analysis** (input → CRS verdict → evidence → next actions → activation)
- **Structured UI leads**; AI supports explanation, interrogation, workflow help
- Workflow CTAs outrank Ask AI in button hierarchy

**How to use this doc**
- `[x]` = reviewed; finding documented
- Status: ✅ Pass · ⚠️ Issue · ❌ Blocker
- Priority: P0 (fix before demo) · P1 (high) · P2 (polish) · P3 (later)

**Test personas**
1. **New user** — first visit, needs to start an analysis
2. **Returning user** — resume ESPN analysis, defend CRS, activate
3. **Explorer** — wants AI help without losing the workflow thread

---

## Global shell (all pages)

| # | Check | Status | Finding | Recommendation | Priority |
|---|-------|--------|---------|----------------|----------|
| G1 | Primary nav reflects real destinations | ⚠️ | Activations / Library / Settings use `href="#"` but JS rewrites to prototype stubs (`espn-detail#tab-activation`, analyses list, ui-foundations) | Label stubs (“Preview”) or use real placeholder pages; Settings → ui-foundations is confusing | P1 |
| G2 | Topbar search matches user mental model | ✅ | Relabeled to “Jump to page”; palette title “Jump to”; honest placeholders | Done 2026-06-08 | — |
| G3 | Search vs AI competition in topbar | ⚠️ | Wide centered search dominates; Ask AI is small outline button | Shrink search footprint; keep Ask AI secondary (per IA) | P1 |
| G4 | Command palette contents | ⚠️ | Includes legacy paths (upload-csv, processed-csvs, chat) not in sidebar | Group palette: **Workflow** / **Data** / **Explore**; remove or hide dev-only entries in prod | P2 |
| G5 | Ask AI available consistently | ⚠️ | Copilot on: dashboard, analyses list/new/detail, audiences. **Missing:** upload-csv, processed-csvs | Either add contextual copilot on data pages or document intentional omission | P2 |
| G6 | Copilot context pill | ✅ | `data-ch-copilot-context` + “Using {context}” works | Keep; ensure every copilot page sets body attribute | — |
| G7 | Mobile search | ✅ | Search icon opens same palette | After G2 relabel, update `aria-label` to “Jump to page” | P2 |
| G8 | Keyboard shortcut ⌘K | ✅ | Works via `initGlobalCommandPalette()` | Keep even if search bar demoted | — |

---

## Dashboard (`index.html`)

| # | Check | Status | Finding | Recommendation | Priority |
|---|-------|--------|---------|----------------|----------|
| D1 | Clear first action for new user | ✅ | “New Analysis” primary + subcopy explains product | Keep | — |
| D2 | Returning user path | ✅ | Recent Analyses above KPIs with CRS + status | Keep | — |
| D3 | KPI prominence vs workflow | ✅ | KPIs labeled “Workspace summary”, visually compact | Keep subdued | — |
| D4 | Quick Start redundancy | ⚠️ | 4 cards + header CTAs + sidebar Analyses all route to `new.html` | Fine for onboarding; add one line: “All paths start a new analysis” | P3 |
| D5 | AI on dashboard hero | ✅ | No chat input in hero (matches IA) | Do **not** add hero AI | — |
| D6 | Copilot suggestions | ✅ | “What should I analyze next?”, “Resume last analysis”, CRS explain | Add inline hint under hero: “Stuck? **Ask AI** explains CRS and next steps” | P2 |
| D7 | Page eyebrow / hierarchy | ✅ | “Workspace” eyebrow + h1 + supporting copy | Keep pattern on other pages (audiences missing eyebrow) | P2 |

---

## Analyses list (`analyses/index.html`)

| # | Check | Status | Finding | Recommendation | Priority |
|---|-------|--------|---------|----------------|----------|
| AL1 | Page purpose clear | ✅ | “Browse… filter by status… open completed evaluations” | Keep | — |
| AL2 | Primary CTA | ✅ | New Analysis button top-right | Keep | — |
| AL3 | Page-level search works | ✅ | `#analyses-search` filters table rows | Keep; distinguish from global palette in copy | P2 |
| AL4 | Global vs local search confusion | ⚠️ | Two “search” UIs with different behavior | Global → “Jump to”; local → “Search analyses” (already labeled) | P1 |
| AL5 | Status filter | ✅ | `#analyses-status` wired in `initAnalysesList()` | Keep | — |
| AL6 | Row → detail affordance | ✅ | Whole row clickable | Keep | — |
| AL7 | Empty / no results state | ⚠️ | Not verified for zero matches after filter | Add “No analyses match” empty state | P2 |

---

## New Analysis (`analyses/new.html`)

| # | Check | Status | Finding | Recommendation | Priority |
|---|-------|--------|---------|----------------|----------|
| NA1 | Step labels present | ✅ | Step 1 / Step 2 headings | Add **Step 3 — Review results** hint after submit | P1 |
| NA2 | Progress indicator | ✅ | Horizontal stepper added (3 steps) | Done 2026-06-08 | — |
| NA3 | Step 2 discoverability | ✅ | Scroll + focus on card select via `initNewAnalysis` | Done 2026-06-08 | — |
| NA4 | Input type guidance | ⚠️ | Card subtitles help but no “when to use which” | Add collapsible “Which input type?” or one-line under grid | P1 |
| NA5 | Generate Analysis affordance | ⚠️ | Button is `<a href="espn-detail.html">` — skips loading/generating state | Add brief “Generating…” toast or intermediate state | P2 |
| NA6 | Audience optional on domain | ✅ | Choose audience modal + optional label | Clarify impact: “Audience improves CRS accuracy” | P2 |
| NA7 | Copilot on this page | ✅ | Suggestions: input type, audience, domain analysis | Add inline prompt chip row under Step 1 heading | P2 |
| NA8 | All input types reachable | ✅ | 5 cards + distinct forms | Keep | — |

---

## Analysis detail (`analyses/espn-detail.html`)

| # | Check | Status | Finding | Recommendation | Priority |
|---|-------|--------|---------|----------------|----------|
| AD1 | CRS verdict + because | ✅ | Score 82 + rationale sentence in header card | Keep | — |
| AD2 | Workflow hint | ✅ | Promoted to `ch-workflow-callout` banner below CRS | Done 2026-06-08 | — |
| AD3 | Tab overload (7 tabs) | ⚠️ | Overview, Audience, Inventory, Blueprint, Campaign Plan, Activation, History | Consider grouping: **Understand** (Overview, Audience) · **Plan** (Inventory, Blueprint, Campaign) · **Activate** · **History** | P1 |
| AD4 | Primary CTA hierarchy | ✅ | Create Activation primary; Ask AI outline in header | Keep per IA | — |
| AD5 | Recommended Next Actions | ✅ | Overview section links to tabs + activation | Move above tab bar or duplicate in sticky footer on mobile | P1 |
| AD6 | Evidence cards + defend score | ✅ | Subscores, View evidence modal, Ask AI about this | Keep; strongest AI pattern in product | — |
| AD7 | Inline AI prompts (Overview) | ✅ | “Ask Cultura AI” chips on Overview tab | Replicate 2–3 chips on Audience + Inventory tabs | P1 |
| AD8 | Tab-specific next action | ⚠️ | Inventory has Send to DSP; Campaign has Create Activation; inconsistent | Each tab ends with one **primary next step** button | P1 |
| AD9 | Activation tab clarity | ✅ | Checklist: Review inventory ✓, Confirm platform ✓, Enter DSP, Submit locked | Add “You are here” on current step | P2 |
| AD10 | Breadcrumb | ✅ | Analyses → ESPN.com Evaluation | Keep | — |
| AD11 | History tab purpose | ⚠️ | Snapshots without explain of why scores changed | One line: “Track how audience or inventory changes affected CRS” | P3 |

---

## Audiences (`audiences.html`)

| # | Check | Status | Finding | Recommendation | Priority |
|---|-------|--------|---------|----------------|----------|
| AU1 | Page purpose | ✅ | Segment insight copy | Keep | — |
| AU2 | Connection to Analysis workflow | ✅ | CTA changed to “Start analysis” → `new.html` | Done 2026-06-08 | — |
| AU3 | Page eyebrow | ⚠️ | Missing `ch-page-eyebrow` (inconsistent with dashboard/analyses) | Add “Workspace” or “Audiences” eyebrow | P2 |
| AU4 | Segment detail depth | ⚠️ | List only; persona detail exists elsewhere (`persona-detail.html`) | Link segment rows to persona detail or preview drawer | P1 |
| AU5 | Copilot | ✅ | Present with segment-focused suggestions | Keep | — |
| AU6 | Footer links | ⚠️ | Campaign workspace modal + Blueprint link — niche | Keep for power users; don’t lead with these | P3 |

---

## Assistant / Chat (`chat/index.html`)

| # | Check | Status | Finding | Recommendation | Priority |
|---|-------|--------|---------|----------------|----------|
| CH1 | Role vs workflow | ✅ | Hero: “Deep-dive assistant… For structured workflows, start from New Analysis” | Keep; best AI positioning in app | — |
| CH2 | Not in primary sidebar | ✅ | Matches IA | Keep chat out of sidebar; palette link OK | — |
| CH3 | Quick actions under composer | ✅ | New Analysis, Analyses, Persona, Dashboard | Keep | — |
| CH4 | No duplicate copilot drawer | ✅ | Full-page chat replaces drawer here | Keep | — |
| CH5 | Attach / voice buttons | ⚠️ | Present but non-functional in preview | Hide or toast “Coming soon” on click | P2 |
| CH6 | Entry discoverability | ⚠️ | Only via command palette “Open Assistant” | Optional: link from copilot drawer “Open full assistant” | P3 |

---

## Data pages (`upload-csv.html`, `processed-csvs/index.html`)

| # | Check | Status | Finding | Recommendation | Priority |
|---|-------|--------|---------|----------------|----------|
| DP1 | Connection to main workflow | ⚠️ | Orphaned from Analysis object; reachable only via palette | Add breadcrumb back to Audiences or Library; sidebar “Library” should land here eventually | P1 |
| DP2 | Upload page states | ✅ | Validation error example + processing spinner — good teaching | Add success path example | P2 |
| DP3 | Ask AI on data pages | ⚠️ | No copilot | Add lightweight copilot: “What columns does my CSV need?” | P2 |
| DP4 | Not in primary nav | ⚠️ | Hidden from sidebar | OK for MVP if Library stub eventually consolidates | P3 |

---

## AI placement summary

| # | Check | Status | Finding | Recommendation | Priority |
|---|-------|--------|---------|----------------|----------|
| AI1 | AI not primary IA | ✅ | Dashboard hero has no chat; sidebar has no Assistant | **Do not** promote AI to hero or replace search with AI input | — |
| AI2 | Contextual AI strength | ✅ | Overview chips, evidence modal, tab-aware copilot suggestions | **Expand** inline chips to more tabs; add near CRS header | P1 |
| AI3 | Topbar Ask AI weight | ✅ | Secondary button | Optional: icon + label on mobile; keep below Create Activation on detail | P2 |
| AI4 | Competing entry points | ⚠️ | Topbar Ask AI + inline chips + evidence modal + full chat | Consistent label: **“Ask Cultura AI”** everywhere | P2 |
| AI5 | Copilot replies (preview) | ⚠️ | Canned `copilotReplyForMessage()` — fine for prototype | Ensure replies always tie back to next workflow action | P2 |

---

## Search placement summary

| # | Check | Status | Finding | Recommendation | Priority |
|---|-------|--------|---------|----------------|----------|
| S1 | Remove top search entirely? | ⚠️ | Low value at MVP scale but ⌘K is useful | **Demote, don’t delete** — icon trigger + honest labeling | P0 |
| S2 | Placeholder accuracy | ✅ | Topbar + palette placeholders updated to match jump-to behavior | Done 2026-06-08 | — |
| S3 | Page-scoped search | ✅ | Analyses list, processed CSVs, chat history each have real filter | Keep; use distinct naming (“Filter analyses”) | P1 |

---

## Recommended implementation order

### P0 — Do first (clarity blockers)
1. **G2 / S2** — Relabel global search → “Jump to…” with honest placeholder
2. **NA2 / NA3** — New Analysis stepper + scroll/focus on Step 2 reveal
3. **AD2** — Promote workflow hint on analysis detail (evidence → next step → activate)
4. **AU2** — Fix audiences CTA copy and intent (“Start analysis with segment”)

### P1 — High impact
5. **AD3 / AD5** — Reduce tab cognitive load; elevate Recommended Next Actions
6. **AD7 / AD8** — Inline AI + per-tab primary next action
7. **AL4 / G1** — Resolve dual-search confusion; clarify nav stubs
8. **DP1** — Connect data pages back to workspace IA

### P2 — Polish
9. **D6 / NA7** — Light “Ask AI” discoverability hints on dashboard + new analysis
10. **G4 / G5** — Palette grouping; copilot on data pages (optional)
11. **CH5** — Hide non-functional chat toolbar buttons

### P3 — Later
12. Quick Start dedup copy, History tab explainer, full Library IA

---

## Walkthrough scripts (manual QA)

Use these when validating fixes:

### Script A — New user
- [ ] Land dashboard → understand product in &lt;10s
- [ ] Click New Analysis → pick Domain → notice Step 2 without hunting
- [ ] Generate → land on detail → understand CRS 82 and why
- [ ] Find next action without reading all 7 tabs

### Script B — Returning user
- [ ] Dashboard → Recent Analyses → ESPN
- [ ] View evidence → Ask AI about score → get defensible summary
- [ ] Create Activation path clear from Overview or Activation tab

### Script C — Explorer
- [ ] Open Ask AI from detail Overview chip
- [ ] Ask “Summarize for client” → reply mentions next workflow step
- [ ] Open full chat → see link back to New Analysis
- [ ] ⌘K jump to Audiences without using sidebar

---

## Files to touch (when implementing)

| Area | Primary files |
|------|----------------|
| Global search / palette | All `*.html` topbar block, `assets/js/app.js` `initGlobalCommandPalette` |
| New Analysis flow | `analyses/new.html`, `assets/js/app.js` `initNewAnalysis`, `assets/css/theme.css` |
| Analysis detail | `analyses/espn-detail.html`, `theme.css` (stepper/callout) |
| Audiences CTA | `audiences.html` |
| Copilot scope | `assets/js/app.js` `initCopilotPages`, per-page shell blocks |
| IA reference | `.cursor/rules/cultura-product-ia.mdc` |

---

*Last audited: 2026-06-08 — static HTML/JS review of prototype pages.*
