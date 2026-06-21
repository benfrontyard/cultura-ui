/**
 * Compact certification status for analysis detail — status only, no export tools.
 */
import { renderBadgeHtml } from "./crs-certification-badge.js";
import {
  buildVerifyUrl,
  getCertificationForAnalysis,
  getAnalysisCertificationState,
  formatCertDate,
} from "../data/crs-certifications.js";
import { getPagePrefix } from "../core/page-context.js";

/**
 * @param {object} opts
 * @param {import('../data/crs-certifications.js').CRSCertification} opts.cert
 * @param {string} [opts.prefix]
 * @param {number} [opts.score]
 */
export function renderCertificationStatusHtml({ cert, prefix = "", score }) {
  const verifyHref = buildVerifyUrl(cert.id, prefix);
  const assetsHref = `${prefix}library/certifications.html?cert=${encodeURIComponent(cert.id)}`;
  const panelId = `crs-cert-panel-${cert.id}`;
  const triggerId = `crs-cert-trigger-${cert.id}`;
  const analysisScore = score ?? cert.score;
  const scoreLine =
    analysisScore != null
      ? `This analysis scored CRS ${analysisScore}. Culture Hive separately issued a ${cert.tierLabel} certification for this property and audience.`
      : "Culture Hive verified this property separately from the analysis score.";

  return `
    <span class="ch-crs-cert-chip" data-crs-cert-chip>
      <button
        type="button"
        class="ch-crs-cert-chip__trigger"
        id="${triggerId}"
        aria-expanded="false"
        aria-haspopup="dialog"
        aria-controls="${panelId}"
        aria-label="${cert.tierLabel} certification. ${scoreLine}"
      >
        ${renderBadgeHtml({
          tier: cert.tier,
          layout: "seal",
          theme: "light",
          size: "md",
          showVerifier: false,
        })}
      </button>
      <div
        class="ch-crs-cert-chip__panel"
        id="${panelId}"
        role="dialog"
        aria-labelledby="${triggerId}"
        aria-hidden="true"
      >
        <div class="ch-crs-cert-chip__panel-head">
          <p class="ch-crs-cert-chip__tier">${cert.tierLabel}</p>
          <p class="ch-crs-cert-chip__verified">Verified by ${cert.verifiedBy}</p>
        </div>
        <p class="ch-crs-cert-chip__explainer">${scoreLine}</p>
        <dl class="ch-crs-cert-chip__facts">
          ${
            analysisScore != null
              ? `<div class="ch-crs-cert-chip__fact"><dt>Analysis score</dt><dd>CRS ${analysisScore}</dd></div>`
              : ""
          }
          <div class="ch-crs-cert-chip__fact"><dt>Audience</dt><dd>${cert.audienceSegment}</dd></div>
          <div class="ch-crs-cert-chip__fact"><dt>Verified</dt><dd>${formatCertDate(cert.verifiedDate)}</dd></div>
        </dl>
        <div class="ch-crs-cert-chip__actions">
          <a class="ch-crs-cert-chip__action ch-crs-cert-chip__action--primary" href="${verifyHref}" target="_blank" rel="noopener noreferrer">View verification</a>
          <a class="ch-crs-cert-chip__action" href="${assetsHref}">Badge assets</a>
        </div>
      </div>
    </span>
  `.trim();
}

/**
 * @param {object} opts
 * @param {number} [opts.score]
 * @param {'pending' | 'eligible'} opts.state
 */
export function renderCertificationHintHtml({ score, state }) {
  if (state === "pending") {
    return `
      <span class="ch-pill ch-pill-warning ch-crs-cert-hint" title="Culture Hive is reviewing this certification">
        Cert pending
      </span>
    `.trim();
  }

  if (state === "eligible" && score != null) {
    return `
      <span class="ch-pill ch-pill-neutral ch-crs-cert-hint" title="CRS ${score} meets certification thresholds. Culture Hive reviews and issues badges separately from analysis scores.">
        CRS cert eligible
      </span>
    `.trim();
  }

  return "";
}

/**
 * @param {HTMLElement} chip
 * @param {HTMLElement} trigger
 * @param {HTMLElement} panel
 */
function wireCertificationChipPanelPosition(chip, trigger, panel) {
  const useFixed = Boolean(chip.closest(".ch-crs-score__cert"));
  if (!useFixed) return () => {};

  const placeholder = document.createComment("crs-cert-panel-anchor");
  chip.appendChild(placeholder);
  document.body.appendChild(panel);
  panel.classList.add("ch-crs-cert-chip__panel--anchored");

  const hoverMedia = window.matchMedia("(hover: hover)");
  let hoverCloseTimer = 0;

  const isVisible = () =>
    chip.classList.contains("is-open") ||
    chip.contains(document.activeElement) ||
    panel.contains(document.activeElement) ||
    (hoverMedia.matches && (chip.matches(":hover") || panel.matches(":hover")));

  const position = () => {
    if (!isVisible()) return;

    const triggerRect = trigger.getBoundingClientRect();
    const panelWidth = panel.offsetWidth;
    const panelHeight = panel.offsetHeight;
    if (!panelWidth || !panelHeight) return;

    const gap = 10;
    const margin = 12;

    let top = triggerRect.top + triggerRect.height / 2 - panelHeight / 2;
    let left = triggerRect.left - panelWidth - gap;

    if (left < margin) {
      left = Math.max(margin, triggerRect.right - panelWidth);
      top = triggerRect.bottom + gap;
    }

    top = Math.max(margin, Math.min(top, window.innerHeight - panelHeight - margin));
    left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin));

    panel.style.top = `${Math.round(top)}px`;
    panel.style.left = `${Math.round(left)}px`;
  };

  const sync = () => {
    const visible = isVisible();
    panel.classList.toggle("is-visible", visible);
    panel.setAttribute("aria-hidden", visible ? "false" : "true");
    trigger.setAttribute("aria-expanded", visible ? "true" : "false");
    if (visible) position();
  };

  const scheduleSync = () => requestAnimationFrame(sync);

  const deferHide = () => {
    clearTimeout(hoverCloseTimer);
    hoverCloseTimer = window.setTimeout(scheduleSync, 120);
  };

  chip.addEventListener("mouseenter", () => {
    clearTimeout(hoverCloseTimer);
    scheduleSync();
  });
  chip.addEventListener("mouseleave", deferHide);
  panel.addEventListener("mouseenter", () => {
    clearTimeout(hoverCloseTimer);
    scheduleSync();
  });
  panel.addEventListener("mouseleave", deferHide);
  chip.addEventListener("focusin", scheduleSync);
  chip.addEventListener("focusout", scheduleSync);
  panel.addEventListener("focusin", scheduleSync);
  panel.addEventListener("focusout", scheduleSync);
  window.addEventListener("scroll", () => {
    if (isVisible()) position();
  }, true);
  window.addEventListener("resize", () => {
    if (isVisible()) position();
  });

  return sync;
}

/**
 * @param {HTMLElement} root
 */
function wireCertificationChip(root) {
  const chip = root.querySelector("[data-crs-cert-chip]");
  if (!chip) return;

  const trigger = chip.querySelector(".ch-crs-cert-chip__trigger");
  const panel = chip.querySelector(".ch-crs-cert-chip__panel");
  if (!trigger || !panel) return;

  const positionPanel = wireCertificationChipPanelPosition(chip, trigger, panel);
  const isAnchored = panel.classList.contains("ch-crs-cert-chip__panel--anchored");

  const close = () => {
    chip.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    if (isAnchored) positionPanel();
  };

  const open = () => {
    chip.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    positionPanel();
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (chip.classList.contains("is-open")) close();
    else open();
  });

  document.addEventListener("click", (event) => {
    if (chip.contains(event.target) || panel.contains(event.target)) return;
    close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

/**
 * Mount certification status on analysis detail pages.
 */
export function mountAnalysisCertificationStatus() {
  const mount = document.querySelector("[data-crs-certification-status]");
  if (!mount) return;

  const analysisId = mount.getAttribute("data-analysis-id") || "";
  const score = Number(mount.getAttribute("data-crs-score")) || null;
  const prefix = getPagePrefix();
  const cert = getCertificationForAnalysis(analysisId);
  const state = getAnalysisCertificationState(score ?? 0, cert);

  if (state === "certified" && cert) {
    mount.innerHTML = renderCertificationStatusHtml({ cert, prefix, score: score ?? undefined });
    mount.hidden = false;
    wireCertificationChip(mount);
    wireCertificationOverflowMenu(cert, prefix);
    return;
  }

  hideCertificationOverflowMenu();

  if (state === "pending" && cert) {
    mount.innerHTML = renderCertificationHintHtml({ state: "pending" });
    mount.hidden = false;
    hideCertificationOverflowMenu();
    return;
  }

  if (state === "eligible") {
    mount.innerHTML = renderCertificationHintHtml({ score: score ?? undefined, state: "eligible" });
    mount.hidden = false;
    hideCertificationOverflowMenu();
    return;
  }

  mount.innerHTML = "";
  mount.hidden = true;
  hideCertificationOverflowMenu();
}

function wireCertificationOverflowMenu(cert, prefix) {
  const items = document.querySelectorAll("[data-crs-cert-menu-item]");
  if (!items.length) return;

  const assetsHref = `${prefix}library/certifications.html?cert=${encodeURIComponent(cert.id)}`;
  const verifyHref = buildVerifyUrl(cert.id, prefix);

  items.forEach((el) => el.classList.remove("d-none"));

  const assetsLink = document.querySelector("[data-crs-cert-assets-link]");
  const verifyLink = document.querySelector("[data-crs-cert-verify-link]");
  if (assetsLink) assetsLink.setAttribute("href", assetsHref);
  if (verifyLink) verifyLink.setAttribute("href", verifyHref);
}

function hideCertificationOverflowMenu() {
  document.querySelectorAll("[data-crs-cert-menu-item]").forEach((el) => {
    el.classList.add("d-none");
  });
}
