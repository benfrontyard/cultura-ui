# Testing

## Playwright E2E

The prototype uses Playwright to guard navigation, sidebar, mobile drawer, Cultura AI dock, and chat demo flows.

### Setup

```bash
npm install
npx playwright install chromium
```

### Run tests

```bash
npm run test:e2e
```

Starts a local static server on port **8765** (`python3 -m http.server`) unless one is already running.

### Environment

| Variable | Purpose |
|----------|---------|
| `PLAYWRIGHT_BASE_URL` | Override base URL (e.g. deployed GitHub Pages) |
| `CI` | Enables retries, fresh webServer |

### Test file

`tests/e2e/prototype.spec.js`

| Test | Validates |
|------|-----------|
| loads home without JS errors | Module graph loads, sign-in works |
| sidebar collapse toggles and persists | localStorage + body class |
| collapsed sidebar after navigation | No `ch-sidebar--restoring` stuck after nav |
| mobile nav drawer opens | Offcanvas `#chNavDrawer` |
| navigates between key pages | Analyses, Audiences, Activations |
| Cultura AI dock expands | FAB + expanded dock class |
| chat dock accepts demo message | User bubble + assistant reply |
| Cultura AI icon on analyses detail | `cultura-icon.png` in author row |

### Parity with GitHub Pages

To compare against deployed prototype:

```bash
PLAYWRIGHT_BASE_URL=https://benfrontyard.github.io/cultura-ui npm run test:e2e
```

Some tests may differ if deployed site still runs legacy `app.js`; prefer testing local modular build for CI.

### Helpers

`assets/js/tests/test-helpers.js` — shared sign-in and error collection (importable from future Node test utilities).

### Manual smoke checklist

1. Sign in on `index.html`
2. Collapse sidebar → navigate to Analyses → sidebar stays collapsed without animation flash
3. Expand Cultura AI dock → send "Explain how CRS scoring works"
4. Open `analyses/espn-detail.html` → verify Cultura icon in chat author row
5. Mobile width → open hamburger offcanvas

## Future

- Visual regression snapshots (optional)
- Split workspace tests per page module as code moves out of `workspace/index.js`
