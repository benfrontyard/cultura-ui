# Chat message schema

Cultura AI chat UI is decoupled from hard-coded HTML strings where possible. Demo content lives in `assets/js/chat/chat-demo-data.js`; rendering templates in `assets/js/chat/chat-templates.js`; session state in `assets/js/chat/chat-store.js`.

## Message shape

```js
{
  id: string,                    // e.g. "msg-1710000000000-abc12"
  role: "user" | "assistant" | "system",
  type: "text" | "markdown" | "score-card" | "recommendation" | "table" | "chart-placeholder" | "analysis-run",
  content: {
    text?: string,               // plain assistant reply (dock)
    markdown?: string,           // rich markdown body
    html?: string,               // pre-rendered HTML (streaming)
    topic?: string,              // demo topic key for follow-ups ("crs", "defend", …)
    title?: string,              // analysis-run overlay title
    target?: string,             // domain/bundle label
    stages?: string[],           // analysis-run step labels
  },
  timestamp: string,             // ISO-8601
  status: "pending" | "complete" | "error",
  actions?: boolean              // show Save/Export/Persona/Report chips
}
```

## Roles

| Role | UI treatment |
|------|----------------|
| `user` | Right-aligned bubble, initials avatar |
| `assistant` | Cultura icon + name, markdown or text body, optional feedback row |
| `system` | Reserved for future status lines (not used in prototype) |

## Types

| Type | Use |
|------|-----|
| `text` | Short copilot dock replies |
| `markdown` | Full chat markdown (headings, lists, blockquotes) |
| `analysis-run` | Generating analysis progress overlay / in-dock run |
| `score-card` | Future CRS evidence cards inline in thread |
| `recommendation` | Future structured next-step cards |
| `table` | Future tabular inventory snippets |
| `chart-placeholder` | Future inline chart slots |

## Demo vs production

| Layer | Prototype | Production (Django/API) |
|-------|-----------|-------------------------|
| Message list | `chatStore.history` in memory | API stream / WebSocket |
| Reply content | `chat-demo-data.js` matchers | LLM + structured tool responses |
| Rendering | `workspace/index.js` + templates | Same renderer, fed API JSON |
| Suggestions | `COPILOT_PAGE_SUGGESTIONS` | Context from view + user permissions |

## API mapping (future)

A Django or REST handler should return JSON arrays of messages matching this schema. The UI layer (`chat-renderer` / controller) maps `type` → DOM without changing templates per response.

Example API payload:

```json
{
  "messages": [
    {
      "id": "m1",
      "role": "assistant",
      "type": "markdown",
      "content": {
        "markdown": "## CRS 82\n\nStrong fit because…",
        "topic": "overview"
      },
      "timestamp": "2026-06-21T12:00:00Z",
      "status": "complete"
    }
  ]
}
```

## Related files

- `assets/js/chat/chat-store.js` — `createChatMessage()`, `chatStore`
- `assets/js/chat/chat-templates.js` — author row, bubbles, typing indicator
- `assets/js/chat/chat-demo-data.js` — intents, suggestions, `copilotReplyForMessage()`
- `assets/js/workspace/index.js` — `dispatchChatExchange()`, dock controller (being split)
