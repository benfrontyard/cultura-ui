# JavaScript architecture

Audit of the former monolithic `assets/js/app.legacy.js` (~4,440 lines) and the modular layout introduced in this refactor.

## Former `app.js` responsibilities

| Area | What it did | New module owner |
|------|-------------|------------------|
| Before-paint restores | Data mode class, AI dock state, sidebar collapse flash prevention | `core/before-paint.js` |
| Layout / sidebar | Collapse toggle, persisted width, nav highlight, nav groups, history buttons | `layout/navigation.js` |
| Mobile nav | Bootstrap offcanvas `#chNavDrawer` | `layout/navigation.js` → `initMobileDrawer()` |
| Auth gate | Login/signup, session localStorage, hero video | `workspace/index.js` (→ future `auth/auth-gate.js`) |
| Toasts | Bootstrap toast host, demo toast triggers | `core/toast.js` |
| Data mode | New vs established account toggle | `core/page-context.js` |
| Command palette | Global search modal filter | `workspace/index.js` |
| Audiences | Catalog fetch, user segments CRUD, picker modal | `workspace/index.js` |
| Chat / Cultura AI dock | Composer, typing, markdown render, suggestions, intents, analysis run | `chat/*` + `workspace/index.js` |
| Copilot | Page/tab suggestions, evidence modal | `chat/chat-demo-data.js` + workspace |
| Library / CSV | Processed file lists, sort/filter tables | `workspace/index.js` |
| Analyses / activations | Table search + status filters | `workspace/index.js` |
| Analysis detail | Tabs, charts, campaign mix edit, deal modal | `pages/analysis-detail.js` hook + workspace |
| New analysis | Stepper, input types, generate overlay | `pages/new-analysis.js` hook + workspace |
| Settings / modals | Help, upgrade, locale | `workspace/index.js` |
| Demo / prototype | Fake JSON, canned chat replies, CRS narrative | `chat/chat-demo-data.js` |

## Current directory layout

```txt
assets/js/
  app.js                 # Deprecated stub (points to app-init)
  app.legacy.js          # Original jQuery monolith (reference)
  ch-icon-sprite-inject.js
  core/
    app-init.js          # Entry: boot + dynamic page imports
    before-paint.js      # Sync restores (classic script)
    constants.js         # CH_COPY, storage keys
    dom-utils.js         # Vanilla DOM + jQuery-compat DomCollection
    page-context.js      # Page id, data mode, prefix paths
    toast.js
  layout/
    navigation.js        # Sidebar, nav, history, mobile drawer
  chat/
    chat-store.js        # Session state + message schema helpers
    chat-templates.js    # HTML fragments for bubbles/chrome
    chat-demo-data.js    # Demo replies, suggestions, intents
  pages/
    dashboard.js         # Per-page hooks (dynamic import)
    analyses.js
    analysis-detail.js
    …
  workspace/
    index.js             # Migrated runtime bundle (element-gated inits)
  tests/
    test-helpers.js      # Playwright helpers
```

## Per-page script loading

All HTML templates share:

1. `ch-icon-sprite-inject.js` (inline SVG icons for `file://` and GH Pages)
2. `core/before-paint.js` (classic script, no module)
3. Bootstrap 5.3 bundle JS
4. Alpine.js 3 (CDN, defer — available for incremental component migration)
5. `core/app-init.js` (`type="module"`)

`app-init.js` always loads `workspace/index.js` (global behavior) and **dynamically imports** one `pages/*.js` module based on `body[data-ch-current]`:

| `data-ch-current` | Page module |
|-------------------|-------------|
| `home` | `pages/dashboard.js` |
| `analyses` | `pages/analyses.js` |
| `analyses-detail` | `pages/analysis-detail.js` |
| `analyses-new` | `pages/new-analysis.js` |
| `audiences` | `pages/audiences.js` |
| `activations` | `pages/activations.js` |
| `library`, `files` | `pages/library.js` |
| `settings` | `pages/settings.js` |
| `foundations` | `pages/foundations.js` |

Most page logic still lives in `workspace/index.js` behind `#element` guards (`if (!$("#analyses-search").length) return`). Page modules are extension points as logic is extracted.

### Nested paths

Pages under `analyses/` and `processed-csvs/` use `../assets/js/…` for the same stack.

## jQuery removal

- **Removed** jQuery CDN from all templates.
- **Replaced** with `core/dom-utils.js` (`$`, `DomCollection`) for migrated code.
- **Kept** Bootstrap 5 JS for modals, tabs, toasts, offcanvas.
- **Added** Alpine.js CDN for future lightweight state (sidebar/dock can migrate to `x-data` incrementally).

## Migration status

- ✅ Modular entry, per-page imports, layout extracted, chat data/templates split
- 🔄 `workspace/index.js` still contains most interaction code (safe migration path)
- 📋 Original preserved in `app.legacy.js`

## Regenerating workspace from legacy

```bash
node scripts/migrate-app-to-modules.mjs
```

This re-wraps `app.legacy.js` into `workspace/index.js` and re-applies layout overrides.
