import { CH_COPY } from "../core/constants.js";
import { escapeHtml } from "../core/dom-utils.js";

export function getChatAssetSrc(filename) {
  const folder = (document.body.getAttribute("data-ch-folder") || "").trim();
  let prefix = folder === "analyses" ? "../" : "";
  if (!prefix) {
    const path = window.location.pathname || "";
    if (path.indexOf("/processed-csvs/") !== -1 || path.indexOf("/chat/") !== -1) prefix = "../";
  }
  return prefix + "assets/img/" + filename;
}

export function buildChatAuthorHtml(role) {
  if (role === "user") return "";
  const icon = getChatAssetSrc("cultura-icon.png");
  return (
    '<div class="ch-chat-author ch-chat-author--assistant">' +
    '<img src="' +
    icon +
    '" alt="" class="ch-chat-author__avatar" width="24" height="24" decoding="async" />' +
    '<span class="ch-chat-author__name">' +
    escapeHtml(CH_COPY.assistantName) +
    "</span></div>"
  );
}

export function chatFeedbackIcon(name) {
  if (name === "copy") {
    return '<svg class="ch-icon ch-icon--sm" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  }
  if (name === "up") {
    return '<svg class="ch-icon ch-icon--sm" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M7 10v11M7 10l4-4 4 4M7 10H3v11h18V10h-4"/></svg>';
  }
  return '<svg class="ch-icon ch-icon--sm" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 14V3M17 14l-4 4-4-4M17 14h4V3H3v11h4"/></svg>';
}

export function buildUserBubbleHtml(text) {
  return (
    '<div class="ch-chat-bubble ch-chat-bubble-user ch-chat-bubble--appear">' +
    '<div class="ch-chat-bubble-user__row">' +
    '<div class="ch-chat-bubble__body"><p class="mb-0">' +
    escapeHtml(text) +
    "</p></div>" +
    '<div class="ch-chat-bubble-user__avatar" aria-hidden="true">NC</div>' +
    "</div></div>"
  );
}

export function buildTypingIndicatorHtml() {
  return (
    '<div class="ch-chat-typing ch-chat-bubble--appear" role="status" aria-live="polite" aria-label="' +
    escapeHtml(CH_COPY.assistantName) +
    ' is typing">' +
    buildChatAuthorHtml("assistant") +
    '<span class="ch-chat-typing__dots" aria-hidden="true"><span></span><span></span><span></span></span></div>'
  );
}

export function buildAssistantActionsHtml() {
  const labels = ["Save", "Export", "Create Persona", "Create Report"];
  const buttons = labels
    .map(
      (label) =>
        '<button type="button" class="btn btn-sm btn-light border ch-chat-actions__btn">' +
        escapeHtml(label) +
        "</button>"
    )
    .join("");
  return '<div class="ch-chat-actions" role="group" aria-label="Message actions">' + buttons + "</div>";
}

export function buildFeedbackHtml() {
  return (
    '<div class="ch-chat-feedback" role="group" aria-label="Message actions">' +
    '<button type="button" class="ch-chat-feedback__btn" data-ch-chat-copy aria-label="Copy response">' +
    chatFeedbackIcon("copy") +
    "</button>" +
    '<button type="button" class="ch-chat-feedback__btn" data-ch-chat-up aria-label="Helpful">' +
    chatFeedbackIcon("up") +
    "</button>" +
    '<button type="button" class="ch-chat-feedback__btn" data-ch-chat-down aria-label="Not helpful">' +
    chatFeedbackIcon("down") +
    "</button></div>"
  );
}
