/**
 * Prototype demo responses for Cultura AI chat.
 * Structured for future API replacement — match user text to canned assistant payloads.
 */
import { getPagePrefix, getCurrentPage } from "../core/page-context.js";
import { chatStore } from "./chat-store.js";

/** @typedef {import('./chat-store.js').ChatMessage} ChatMessage */

/**
 * @param {string} pagePrefix
 * @returns {Record<string, { topic: string, markdown: string, actions?: boolean }>}
 */
export function buildRichReplyCatalog(pagePrefix) {
  return {
    crs: {
      topic: "crs",
      markdown:
        "## How CRS scoring works\n\n" +
        "**Cultural Relevance Score (CRS)** measures how well a publisher, app, or creative fits a target audience's cultural context, not just demographics.\n\n" +
        "### Four dimensions\n" +
        "1. **Audience alignment** (40%): Does the environment reach your segment with intent?\n" +
        "2. **Editorial / UX signals** (30%): Mobile patterns, content depth, daily-use rituals.\n" +
        "3. **Ownership & authenticity** (15%): Credible voice, community features, bilingual paths.\n" +
        "4. **Intersectional representation** (15%): Sustained coverage beyond tokenism.\n\n" +
        `**Next step:** Open **[New Analysis](${pagePrefix}analyses/new.html)** to score your next domain or brief.`,
      actions: false,
    },
  };
}

/** Page-aware short copilot replies (dock). */
export function copilotReplyForMessage(text, context) {
  const t = (text || "").toLowerCase();
  const page = getCurrentPage();

  const detailRoot = document.getElementById("analyses-detail");
  if (detailRoot) {
    const title = (detailRoot.querySelector("h1")?.textContent || "This analysis").trim();
    const score = (detailRoot.querySelector(".ch-crs-score__number")?.textContent || "").trim();
    if (t.indexOf("improve") !== -1 || t.indexOf("score") !== -1) {
      return `${title} scores CRS ${score || "—"} from dimension contributions. Open the Overview tab for the score breakdown.`;
    }
    return `${title} (CRS ${score || "—"}). Next: review evidence in Overview or continue toward Activation.`;
  }
  if (context.indexOf("ESPN") !== -1) {
  if (context.indexOf("Home") !== -1 || page === "home") {
    return "Start with New Analysis to evaluate a domain, brief, or creative.";
  }
  if (page === "audiences") {
    return "Pick a segment and click Start analysis, or save your own under My segments.";
  }
  if (page === "activations") {
    return "ESPN.com Evaluation is ready for DSP setup (CRS 82). Click Continue setup to enter deal details.";
  }
  return "I can help explain CRS scores, summarize analyses, or guide activation steps. Try New Analysis when ready.";
}

/** Match user message to rich markdown demo reply (full chat page). */
export function matchRichDemoReply(text, { pagePrefix, blueprintMarkdown }) {
  const t = (text || "").toLowerCase().trim();

  if (
    t.indexOf("crs") !== -1 &&
    (t.indexOf("explain") !== -1 || t.indexOf("how") !== -1 || t.indexOf("work") !== -1 || t.indexOf("scoring") !== -1)
  ) {
    return { topic: "crs", type: "markdown", content: { markdown: buildRichReplyCatalog(pagePrefix).crs.markdown }, actions: false };
  }

  if (t.indexOf("thank") !== -1 || t === "ty" || t === "thanks") {
    return {
      topic: "thanks",
      type: "text",
      content: { text: "You're welcome. Pick a next step from your analysis when ready." },
      actions: false,
    };
  }

  if (blueprintMarkdown && (t.indexOf("blueprint") !== -1 || t.indexOf("sustainable") !== -1)) {
    return { topic: "blueprint", type: "markdown", content: { markdown: blueprintMarkdown }, actions: true };
  }

  if (t.indexOf("more") !== -1 && chatStore.lastTopic === "crs") {
    return matchRichDemoReply("Explain how CRS scoring works", { pagePrefix, blueprintMarkdown });
  }

  return null;
}

export const DOCK_GENERIC_SUGGESTIONS = [
  "Explain how CRS scoring works",
  "What should I analyze next?",
  "Help me defend a CRS score to a buyer",
];

export const COPILOT_PAGE_SUGGESTIONS = {
  home: DOCK_GENERIC_SUGGESTIONS,
  analyses: ["Compare two analyses in my workspace", "Filter activation-ready analyses", "What makes a strong CRS score?"],
  "analyses-new": DOCK_GENERIC_SUGGESTIONS,
  audiences: ["How does Diego Ramirez affect CRS?", "What stereotypes should we avoid?", "Use this segment in a new analysis"],
  activations: ["Which analyses are ready to activate?", "What does Ready for DSP setup mean?", "Walk me through creating a deal ID"],
  library: ["Where do I upload audience CSVs?", "Why did my file fail validation?", "How do I use processed files in an analysis?"],
  settings: ["What's included in the Free Plan?", "How do I connect my DSP?", "Where are notification settings?"],
};

export const ANALYSIS_COPILOT_SUGGESTIONS = {
  "#tab-overview": ["Explain why this scored 82", "What would improve the score?", "Summarize for a client", "What are the top risks?"],
  "#tab-audience": ["Turn this persona into targeting criteria", "What creative tone would resonate?", "What stereotypes should we avoid?"],
  "#tab-inventory": ["Why was this domain included?", "Find more Spanish-language sports inventory", "Exclude general-market domains"],
  "#tab-blueprint": ["Summarize this blueprint in 3 bullets", "What cultural tensions should we be aware of?"],
  "#tab-campaign-plan": ["Recommend a lower-budget version", "Adjust this for awareness", "Rewrite this for a media buyer"],
  "#tab-activation": ["What DSPs work best for this audience?", "Estimate reach for $5k/week"],
};

export const AI_DOCK_INTENTS = {
  domain: { placeholder: "Enter domain (www.domain.com) for CRS evaluation", cta: "Analyze", ctaMode: "workflow", triggerText: "Enter a domain for CRS evaluation…", showAttachments: false },
  bundle: { placeholder: "Enter app or Bundle ID for CRS evaluation", cta: "Analyze", ctaMode: "workflow", triggerText: "Enter Bundle ID for CRS evaluation…", showAttachments: false },
  brief: { placeholder: "Describe your campaign or attach a brief below", cta: "Analyze", ctaMode: "workflow", triggerText: "Upload a campaign brief for cultural signals…", showAttachments: true, attachKind: "brief" },
  creative: { placeholder: "Describe the creative or attach an asset below", cta: "Analyze", ctaMode: "workflow", triggerText: "Review creative for cultural fit…", showAttachments: true, attachKind: "creative" },
  audience: { placeholder: "Describe your audience segment hypothesis", cta: "Start", ctaMode: "navigate", triggerText: "Start from an audience segment…", showAttachments: false },
  ask: { placeholder: "Ask about CRS scores, cultural fit, or recommendations…", cta: "Ask", ctaMode: "chat", triggerText: "Ask about CRS scores, site fit, or recommendations…", showAttachments: false },
};
