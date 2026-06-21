# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: prototype.spec.js >> Culture Hive prototype >> Cultura AI dock expands
- Location: tests/e2e/prototype.spec.js:65:3

# Error details

```
Error: Channel closed
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('.ch-ai-dock__fab[data-ch-ai-dock-expand]')
    - locator resolved to <button type="button" class="ch-ai-dock__fab" data-ch-ai-dock-expand="" aria-label="Ask Cultura AI">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" data-bs-dismiss="toast" aria-label="Dismiss notification" class="btn-close btn-close-white me-2 m-auto"></button> from <div id="chToastHost" aria-live="polite" class="toast-container position-fixed bottom-0 end-0 p-3">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" data-bs-dismiss="toast" aria-label="Dismiss notification" class="btn-close btn-close-white me-2 m-auto"></button> from <div id="chToastHost" aria-live="polite" class="toast-container position-fixed bottom-0 end-0 p-3">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    5 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" data-bs-dismiss="toast" aria-label="Dismiss notification" class="btn-close btn-close-white me-2 m-auto"></button> from <div id="chToastHost" aria-live="polite" class="toast-container position-fixed bottom-0 end-0 p-3">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms

```

```
Error: browserContext.close: Target page, context or browser has been closed
```