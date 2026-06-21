/**
 * Library → Certifications hub — manage and download CRS badge assets.
 */
import {
  getCertifications,
  getCertificationById,
  buildVerifyUrl,
  formatCertDate,
  CRS_STATUS_LABELS,
  CRS_STATUS_PILL,
} from "../data/crs-certifications.js";
import {
  renderBadgeHtml,
  renderBadgeSvg,
  getExportFilename,
  downloadSvg,
  downloadBlob,
  svgToPngBlob,
  PNG_PRESETS,
} from "../components/crs-certification-badge.js";
import { showToast } from "../core/toast.js";

const GUIDELINES_HTML = `
  <ul class="small text-ch-secondary mb-0 ps-3">
    <li class="mb-2">Use the badge only for the certified property and audience segment shown on the certification record.</li>
    <li class="mb-2">Choose layout by placement: <strong>Primary</strong> for hero, print, and verification pages; <strong>Compact</strong> for cards and headers; <strong>Seal</strong> for inline UI and tight spaces.</li>
    <li class="mb-2">Do not alter badge text, colors, shape, tier labels, or the verifier line ("Verified by Culture Hive").</li>
    <li class="mb-2">Keep clear space around the badge equal to at least the height of the CRS seal.</li>
    <li class="mb-2">Use SVG for websites and print-ready layouts when possible.</li>
    <li class="mb-2">Use PNG for decks, previews, and simple web placement.</li>
    <li class="mb-2">Use the monochrome version for black-and-white or low-ink print.</li>
    <li>Link the badge to its public verification page whenever used online.</li>
  </ul>
`;

function statusPill(status) {
  const cls = CRS_STATUS_PILL[status] || "ch-pill-neutral";
  return `<span class="ch-pill ${cls}">${CRS_STATUS_LABELS[status] || status}</span>`;
}

function renderTableRow(cert) {
  return `
    <tr data-cert-id="${cert.id}" role="button" tabindex="0" style="cursor:pointer">
      <td class="fw-semibold">${cert.propertyName}</td>
      <td class="text-ch-secondary">${cert.audienceSegment}</td>
      <td>${cert.tierLabel}</td>
      <td>${cert.score ?? "—"}</td>
      <td>${formatCertDate(cert.verifiedDate)}</td>
      <td>${statusPill(cert.status)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-outline-primary" data-cert-open="${cert.id}">Manage</button>
      </td>
    </tr>
  `;
}

function renderDetailPanel(cert) {
  const verifyUrl = buildVerifyUrl(cert.id, "../");
  const theme = cert.layoutDefaults?.preferredTheme || "light";

  const pngButtons = PNG_PRESETS.map(
    (p) =>
      `<button type="button" class="btn btn-outline-secondary btn-sm" data-cert-png="${cert.id}" data-cert-width="${p.width}" data-cert-theme="${theme}">${p.label}</button>`
  ).join("");

  const themeExports = ["light", "dark", "mono"]
    .map(
      (t) =>
        `<button type="button" class="btn btn-outline-secondary btn-sm" data-cert-svg="${cert.id}" data-cert-theme="${t}">SVG (${t})</button>`
    )
    .join("");

  return `
    <div class="ch-crs-cert-detail">
      <div class="mb-4">
        <div class="small fw-semibold text-ch-muted mb-3 text-center">Badge layouts</div>
        <div class="d-flex flex-wrap justify-content-center align-items-end gap-4 mb-4">
          ${["primary", "compact", "seal"]
            .map(
              (badgeLayout) => `
            <div class="text-center">
              ${renderBadgeHtml({
                tier: cert.tier,
                layout: badgeLayout,
                theme,
                size: badgeLayout === "seal" ? "md" : "lg",
                showVerifier: badgeLayout !== "seal",
              })}
              <div class="small text-ch-muted mt-2 text-capitalize">${badgeLayout === "seal" ? "Seal only" : badgeLayout}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <dl class="row small mb-4">
        <dt class="col-5 text-ch-muted">Property</dt>
        <dd class="col-7 fw-semibold mb-2">${cert.propertyName}</dd>
        <dt class="col-5 text-ch-muted">Publisher</dt>
        <dd class="col-7 mb-2">${cert.publisherName || "—"}</dd>
        <dt class="col-5 text-ch-muted">Audience segment</dt>
        <dd class="col-7 mb-2">${cert.audienceSegment}</dd>
        <dt class="col-5 text-ch-muted">Certification</dt>
        <dd class="col-7 mb-2">${cert.tierLabel}</dd>
        <dt class="col-5 text-ch-muted">CRS score</dt>
        <dd class="col-7 mb-2">${cert.score ?? "—"}</dd>
        <dt class="col-5 text-ch-muted">Verified</dt>
        <dd class="col-7 mb-2">${formatCertDate(cert.verifiedDate)}</dd>
        <dt class="col-5 text-ch-muted">Review by</dt>
        <dd class="col-7 mb-2">${cert.expiresDate ? formatCertDate(cert.expiresDate) : "—"}</dd>
        <dt class="col-5 text-ch-muted">Status</dt>
        <dd class="col-7 mb-0">${statusPill(cert.status)}</dd>
      </dl>

      <div class="mb-3">
        <label class="form-label small fw-semibold">Verification link</label>
        <div class="input-group input-group-sm">
          <input type="text" class="form-control font-monospace" readonly value="${verifyUrl}" data-cert-verify-input />
          <button type="button" class="btn btn-outline-primary" data-cert-copy="${cert.id}">Copy</button>
        </div>
      </div>

      <div class="mb-3">
        <div class="small fw-semibold mb-2">Download SVG</div>
        <div class="d-flex flex-wrap gap-2">${themeExports}</div>
      </div>

      <div class="mb-0">
        <div class="small fw-semibold mb-2">Download PNG</div>
        <div class="d-flex flex-wrap gap-2 mb-2">${pngButtons}</div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="certSolidBg" data-cert-solid-bg />
          <label class="form-check-label small" for="certSolidBg">Solid background (PNG)</label>
        </div>
      </div>
    </div>
  `;
}

async function exportCertSvg(cert, theme) {
  const svg = renderBadgeSvg({
    tier: cert.tier,
    layout: cert.layoutDefaults?.preferredLayout || "primary",
    theme,
    size: "lg",
    showVerifier: true,
  });
  downloadSvg(svg, getExportFilename({ tier: cert.tier, theme, format: "svg" }));
  showToast(`Downloaded ${theme} SVG.`, "success");
}

async function exportCertPng(cert, width, theme, solidBg) {
  const svg = renderBadgeSvg({
    tier: cert.tier,
    layout: cert.layoutDefaults?.preferredLayout || "primary",
    theme,
    size: "lg",
    showVerifier: true,
  });
  const background =
    solidBg && theme === "dark" ? "#151d2b" : solidBg ? "#ffffff" : "transparent";
  const blob = await svgToPngBlob(svg, width, { background });
  downloadBlob(blob, getExportFilename({ tier: cert.tier, theme, format: "png" }));
  showToast(`Downloaded PNG (${width}px).`, "success");
}

function openDetail(cert) {
  const panel = document.querySelector("[data-crs-cert-detail-body]");
  const title = document.querySelector("[data-crs-cert-detail-title]");
  const offcanvasEl = document.getElementById("chCertDetailDrawer");
  if (!panel || !offcanvasEl || typeof bootstrap === "undefined") return;

  if (title) title.textContent = cert.propertyName;
  panel.innerHTML = renderDetailPanel(cert);

  bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl).show();
}

let certificationsInitialized = false;

export function initPage() {
  if (certificationsInitialized) return;
  certificationsInitialized = true;
  const tableBody = document.querySelector("[data-crs-cert-table-body]");
  const guidelines = document.querySelector("[data-crs-cert-guidelines]");
  if (!tableBody) return;

  const certs = getCertifications();
  tableBody.innerHTML = certs.map(renderTableRow).join("");

  if (guidelines) guidelines.innerHTML = GUIDELINES_HTML;

  const params = new URLSearchParams(window.location.search);
  const preselect = params.get("cert");
  if (preselect) {
    const cert = getCertificationById(preselect);
    if (cert) window.setTimeout(() => openDetail(cert), 300);
  }

  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cert-open]");
    const row = e.target.closest("tr[data-cert-id]");
    const id = btn?.getAttribute("data-cert-open") || row?.getAttribute("data-cert-id");
    if (!id) return;
    const cert = getCertificationById(id);
    if (cert) openDetail(cert);
  });

  tableBody.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const row = e.target.closest("tr[data-cert-id]");
    if (!row) return;
    e.preventDefault();
    const cert = getCertificationById(row.getAttribute("data-cert-id"));
    if (cert) openDetail(cert);
  });

  document.addEventListener("click", async (e) => {
    const copyBtn = e.target.closest("[data-cert-copy]");
    if (copyBtn) {
      const input = document.querySelector("[data-cert-verify-input]");
      if (input) {
        await navigator.clipboard.writeText(input.value);
        showToast("Verification link copied.", "success");
      }
      return;
    }

    const svgBtn = e.target.closest("[data-cert-svg]");
    if (svgBtn) {
      const cert = getCertificationById(svgBtn.getAttribute("data-cert-svg"));
      const theme = svgBtn.getAttribute("data-cert-theme") || "light";
      if (cert) await exportCertSvg(cert, theme);
      return;
    }

    const pngBtn = e.target.closest("[data-cert-png]");
    if (pngBtn) {
      const cert = getCertificationById(pngBtn.getAttribute("data-cert-png"));
      const width = Number(pngBtn.getAttribute("data-cert-width")) || 640;
      const theme = pngBtn.getAttribute("data-cert-theme") || "light";
      const solidBg = document.querySelector("[data-cert-solid-bg]")?.checked;
      if (cert) {
        try {
          await exportCertPng(cert, width, theme, solidBg);
        } catch (err) {
          showToast("PNG export failed. Try again.", "danger");
        }
      }
    }
  });
}
