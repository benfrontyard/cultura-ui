/**
 * @typedef {'user' | 'assistant' | 'system'} ChatRole
 * @typedef {'text' | 'markdown' | 'score-card' | 'recommendation' | 'table' | 'chart-placeholder' | 'analysis-run'} ChatMessageType
 * @typedef {'pending' | 'complete' | 'error'} ChatMessageStatus
 *
 * @typedef {object} ChatMessage
 * @property {string} id
 * @property {ChatRole} role
 * @property {ChatMessageType} type
 * @property {object} content - `{ text?: string, markdown?: string, html?: string, topic?: string }`
 * @property {string} [timestamp]
 * @property {ChatMessageStatus} status
 * @property {boolean} [actions]
 */

/** @returns {ChatMessage} */
export function createChatMessage(partial) {
  return {
    id: partial.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: partial.role || "assistant",
    type: partial.type || "text",
    content: partial.content || {},
    timestamp: partial.timestamp || new Date().toISOString(),
    status: partial.status || "complete",
    actions: partial.actions,
  };
}

/** In-memory chat session for prototype demo flows. */
export const chatStore = {
  generating: false,
  token: 0,
  history: /** @type {ChatMessage[]} */ ([]),
  lastTopic: "",
};

export function resetChatStore() {
  chatStore.generating = false;
  chatStore.token += 1;
  chatStore.history = [];
  chatStore.lastTopic = "";
}

export function pushChatHistory(message) {
  chatStore.history.push(message);
}
