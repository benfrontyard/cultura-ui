/**
 * Public CRS verification page — outside app shell.
 */
import {
  getCertificationById,
  formatCertDate,
  CRS_STATUS_LABELS,
  CRS_STATUS_PILL,
} from "../data/crs-certifications.js";
import { renderBadgeHtml } from "../components/crs-certification-badge.js";

const DEFAULT_ID = "cert-iheart-elite-001";

function statusPillClass(status) {
  return CRS_STATUS_PILL[status] || "ch-pill-neutral";
}

/**
 * @param {import('../data/crs-certifications.js').CRSCertification} cert
 */
function subheadCopy(cert) {
  return `Certified for ${cert.audienceSegment} — recognizing exceptional cultural relevance for this audience segment.`;
}

/**
 * @param {import('../data/crs-certifications.js').CRSCertification} cert
 */
function methodologyCopy(cert) {
  const name = cert.propertyName || cert.publisherName;
  const scoreLine =
    cert.score != null
      ? `${name} scored ${cert.score} on CRS for ${cert.audienceSegment}`
      : `${name} meets Culture Hive's CRS threshold for ${cert.audienceSegment}`;

  return `${scoreLine} because it demonstrates strong cultural relevance with this segment. Certifications are issued using Culture Hive's proprietary CRS methodology.`;
}

/**
 * @param {import('../data/crs-certifications.js').CRSCertification} cert
 */
function propertyValue(cert) {
  const label = cert.propertyName || cert.publisherName || "—";
  if (cert.propertyUrl) {
    return `<a class="ch-crs-verify-details__link" href="${cert.propertyUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }
  return label;
}

/**
 * @param {import('../data/crs-certifications.js').CRSCertification} cert
 */
function renderDetails(cert) {
  const statusLabel = CRS_STATUS_LABELS[cert.status] || cert.status;
  const statusClass = statusPillClass(cert.status);

  return `
    <div class="ch-crs-verify-details__row">
      <span class="ch-crs-verify-details__label">Property</span>
      <span class="ch-crs-verify-details__value">${propertyValue(cert)}</span>
    </div>
    ${
      cert.publisherName && cert.publisherName !== cert.propertyName
        ? `<div class="ch-crs-verify-details__row">
      <span class="ch-crs-verify-details__label">Publisher</span>
      <span class="ch-crs-verify-details__value">${cert.publisherName}</span>
    </div>`
        : ""
    }
    <div class="ch-crs-verify-details__row">
      <span class="ch-crs-verify-details__label">Audience segment</span>
      <span class="ch-crs-verify-details__value">${cert.audienceSegment}</span>
    </div>
    <div class="ch-crs-verify-details__row">
      <span class="ch-crs-verify-details__label">Verified by</span>
      <span class="ch-crs-verify-details__value">${cert.verifiedBy}</span>
    </div>
    <div class="ch-crs-verify-details__row">
      <span class="ch-crs-verify-details__label">Date verified</span>
      <span class="ch-crs-verify-details__value">${formatCertDate(cert.verifiedDate)}</span>
    </div>
    ${
      cert.expiresDate
        ? `<div class="ch-crs-verify-details__row">
      <span class="ch-crs-verify-details__label">Review by</span>
      <span class="ch-crs-verify-details__value">${formatCertDate(cert.expiresDate)}</span>
    </div>`
        : ""
    }
    <div class="ch-crs-verify-details__row">
      <span class="ch-crs-verify-details__label">Status</span>
      <span class="ch-crs-verify-details__value">
        <span class="ch-pill ${statusClass}">${statusLabel}</span>
      </span>
    </div>
    <div class="ch-crs-verify-details__row ch-crs-verify-details__row--id">
      <span class="ch-crs-verify-details__label">Certification ID</span>
      <span class="ch-crs-verify-details__value ch-crs-verify-details__value--mono">${cert.id}</span>
    </div>
  `;
}

function renderNotFound(requestedId) {
  const main = document.getElementById("crsVerifyMain");
  if (!main) return;

  document.title = "Certification not found | Culture Hive";

  main.innerHTML = `
    <div class="ch-crs-verify-not-found">
      <h1 class="ch-crs-verify-page__headline">Certification not found</h1>
      <p class="ch-crs-verify-page__subhead">
        ${
          requestedId
            ? `No certification record matches <code class="ch-crs-verify-details__value--mono">${requestedId}</code>. Check the link and try again.`
            : "This verification link is missing a certification ID."
        }
      </p>
      <div class="ch-crs-verify-page__actions">
        <a class="btn btn-primary btn-sm" href="index.html">Learn about Culture Hive</a>
      </div>
    </div>
  `;
}

export function initVerifyPage() {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const cert = requestedId
    ? getCertificationById(requestedId)
    : getCertificationById(DEFAULT_ID);

  if (!cert) {
    renderNotFound(requestedId);
    return;
  }

  const publisher = cert.publisherName || cert.propertyName;
  const headline = document.querySelector("[data-crs-verify-headline]");
  const subhead = document.querySelector("[data-crs-verify-subhead]");
  const badgeMount = document.getElementById("crsVerifyBadge");
  const statusEl = document.querySelector("[data-crs-verify-status]");
  const details = document.querySelector("[data-crs-verify-details]");
  const methodology = document.querySelector("[data-crs-verify-methodology]");
  const layout = cert.layoutDefaults?.preferredLayout || "primary";
  const theme = cert.layoutDefaults?.preferredTheme || "light";

  if (headline) {
    headline.textContent = `${publisher} has earned a ${cert.tierLabel}`;
  }

  if (subhead) subhead.textContent = subheadCopy(cert);

  if (badgeMount) {
    badgeMount.innerHTML = renderBadgeHtml({
      tier: cert.tier,
      layout,
      theme,
      size: "lg",
      showVerifier: true,
    });
  }

  if (statusEl && cert.status === "active") {
    statusEl.hidden = false;
    statusEl.innerHTML = `<span class="ch-pill ${statusPillClass(cert.status)}">Active certification</span>`;
  }

  if (details) details.innerHTML = renderDetails(cert);

  if (methodology) methodology.textContent = methodologyCopy(cert);

  document.title = `${cert.tierLabel} Verification | Culture Hive`;
}
