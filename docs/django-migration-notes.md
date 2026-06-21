# Django migration notes

Guidance for moving this static prototype into a Django app while preserving the UI shell and modular JS.

## Recommended template structure

```txt
templates/
  base.html                 # <html>, fonts, Bootstrap, theme.css, global scripts
  includes/
    icon_sprite.html
    auth_gate.html
    sidebar.html
    topbar.html
    ai_dock.html
    toast_host.html
    modals/
      help.html
      upgrade.html
      command_palette.html
  pages/
    home.html
    analyses/list.html
    analyses/detail.html
    analyses/new.html
    audiences/list.html
    activations/list.html
    library/index.html
    library/upload_csv.html
    settings/index.html
```

### `base.html` scripts (maps to current prototype)

```html
<script src="{% static 'js/ch-icon-sprite-inject.js' %}"></script>
<script src="{% static 'js/core/before-paint.js' %}"></script>
<script src="{% static 'vendor/bootstrap/bootstrap.bundle.min.js' %}"></script>
<script defer src="{% static 'vendor/alpine/alpine.min.js' %}"></script>
<script type="module" src="{% static 'js/core/app-init.js' %}"></script>
{% block page_scripts %}{% endblock %}
```

### Per-page scripts

```html
{% block page_scripts %}
<script type="module" src="{% static 'js/pages/analysis-detail.js' %}"></script>
{% endblock %}
```

Or rely on `data-ch-current` on `<body>` and keep dynamic import in `app-init.js` (current prototype approach).

## Partials / includes

| UI piece | Include | Notes |
|----------|---------|-------|
| Sidebar nav | `includes/sidebar.html` | Active state from `request.resolver_match.url_name` |
| Cultura AI dock | `includes/ai_dock.html` | Same markup on every workspace page |
| Auth gate | `includes/auth_gate.html` | Replace localStorage session with Django auth |
| Command palette | `includes/modals/command_palette.html` | Links generated from `reverse()` |
| Toast host | `includes/toast_host.html` | Server messages via context or HTMX |

## Data that should come from Django

| Prototype source | Production source |
|------------------|-------------------|
| `audiences.json` fetch | `Audience` model API / view context |
| `PROCESSED_CSV_ROWS` in JS | `ProcessedUpload` queryset |
| Analyses table rows (static HTML) | `Analysis` list view |
| ESPN detail tabs content | `Analysis` detail view + partials |
| `chat-demo-data.js` replies | Cultura AI backend / streaming API |
| `CH_ESPN_CAMPAIGN_MIX` | Campaign plan model or API |
| Auth localStorage flag | Django session + `@login_required` |

## Alpine.js components (incremental)

| Behavior | Alpine candidate | Current module |
|----------|------------------|----------------|
| Sidebar collapsed | `x-data="{ collapsed }"` on `<body>` | `layout/navigation.js` |
| AI dock expand/intent | `x-data` on `#chAiDock` | `workspace/index.js` |
| Table filters | `x-model` on search inputs | workspace list inits |
| Campaign mix edit | `x-data` on edit panel | workspace analysis detail |

Alpine is loaded but most behavior still uses vanilla DOM from the migration; convert hot paths when wiring Django forms.

## Prototype-only (do not ship to production)

- `localStorage` session gate (`ch_session`) — use Django auth
- `ch_data_mode` established/new toggle — dev/demo fixture only
- Canned chat matchers in `chat-demo-data.js`
- Toast-on-click demo handlers (`data-ch-demo-toast`)
- Fake analysis run redirect to static ESPN HTML
- `app.legacy.js` / jQuery bundle

## Static assets

Copy `assets/css/theme.css`, `assets/js/**`, `assets/img/**`, `vendor/streamline-vectors/**` into Django `static/`. Keep relative paths in chat templates (`getChatAssetSrc`) or replace with `{% static 'img/cultura-icon.png' %}` in templates.

## URL mapping

| Static file | Django route (example) |
|-------------|------------------------|
| `index.html` | `/` |
| `analyses/index.html` | `/analyses/` |
| `analyses/espn-detail.html` | `/analyses/<uuid>/` |
| `analyses/new.html` | `/analyses/new/` |
| `audiences.html` | `/audiences/` |
| `activations.html` | `/activations/` |
| `library.html` | `/library/` |

Set `data-ch-current` and `data-ch-folder` in each template for JS page detection.
