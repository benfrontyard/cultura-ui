/**
 * Interactive badge preview panel with live controls.
 */
import { renderBadgeHtml } from "./crs-certification-badge.js";
import { mountBadgeExportControls } from "./badge-export-controls.js";

const TIERS = ["verified", "high", "elite"];
const LAYOUTS = ["primary", "compact", "seal"];
const THEMES = ["light", "dark", "mono"];
const SIZES = ["sm", "md", "lg", "xl"];

/**
 * @param {HTMLElement} root
 */
export function initBadgePreviewPanel(root) {
  if (!root) return;

  root.innerHTML = `
    <div class="ch-crs-badge-lab__controls" data-crs-controls>
      <div>
        <label class="form-label small fw-semibold mb-1" for="crsTier">Tier</label>
        <select class="form-select form-select-sm" id="crsTier" data-crs-tier>
          <option value="verified">CRS Verified</option>
          <option value="high">High CRS Score</option>
          <option value="elite" selected>Elite CRS Score</option>
        </select>
      </div>
      <div>
        <label class="form-label small fw-semibold mb-1" for="crsLayout">Layout</label>
        <select class="form-select form-select-sm" id="crsLayout" data-crs-layout>
          <option value="primary" selected>Primary</option>
          <option value="compact">Compact</option>
          <option value="seal">Seal only</option>
        </select>
      </div>
      <div>
        <label class="form-label small fw-semibold mb-1" for="crsTheme">Theme</label>
        <select class="form-select form-select-sm" id="crsTheme" data-crs-theme>
          <option value="light" selected>Light</option>
          <option value="dark">Dark</option>
          <option value="mono">Monochrome</option>
        </select>
      </div>
      <div>
        <label class="form-label small fw-semibold mb-1" for="crsSize">Size</label>
        <select class="form-select form-select-sm" id="crsSize" data-crs-size>
          <option value="sm">Small</option>
          <option value="md" selected>Medium</option>
          <option value="lg">Large</option>
          <option value="xl">Extra large</option>
        </select>
      </div>
      <div>
        <label class="form-label small fw-semibold mb-1" for="crsPublisher">Publisher (optional)</label>
        <input type="text" class="form-control form-control-sm" id="crsPublisher" data-crs-publisher placeholder="iHeart Media" />
      </div>
      <div class="d-flex align-items-end">
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" id="crsVerifier" data-crs-verifier checked />
          <label class="form-check-label small" for="crsVerifier">Show verifier</label>
        </div>
      </div>
    </div>
    <div class="ch-crs-badge-lab__preview-stage" data-crs-preview-stage>
      <div data-crs-preview-mount></div>
    </div>
    <div data-crs-export-mount></div>
  `;

  const previewMount = root.querySelector("[data-crs-preview-mount]");
  const previewStage = root.querySelector("[data-crs-preview-stage]");
  const exportMount = root.querySelector("[data-crs-export-mount]");

  function readOpts() {
    return {
      tier: root.querySelector("[data-crs-tier]")?.value || "elite",
      layout: root.querySelector("[data-crs-layout]")?.value || "primary",
      theme: root.querySelector("[data-crs-theme]")?.value || "light",
      size: root.querySelector("[data-crs-size]")?.value || "md",
      showVerifier: root.querySelector("[data-crs-verifier]")?.checked ?? true,
      publisherName: root.querySelector("[data-crs-publisher]")?.value?.trim() || undefined,
    };
  }

  function render() {
    const opts = readOpts();
    previewMount.innerHTML = renderBadgeHtml(opts);
    previewStage.classList.toggle("ch-crs-badge-lab__preview-stage--dark", opts.theme === "dark");
    exportControls.update(opts);
  }

  const exportControls = mountBadgeExportControls(exportMount, readOpts());

  root.querySelector("[data-crs-controls]")?.addEventListener("change", render);
  root.querySelector("[data-crs-publisher]")?.addEventListener("input", render);

  render();
}

/**
 * Render a static matrix of all tier × layout × theme combinations.
 * @param {HTMLElement} container
 */
export function renderBadgeMatrix(container) {
  if (!container) return;

  const sections = [
    { title: "All tiers — Primary layout (light)", layout: "primary", theme: "light", tiers: TIERS },
    { title: "Core layouts — Elite tier (light)", layout: null, theme: "light", tiers: ["elite"], layouts: LAYOUTS },
    { title: "All themes — Elite primary", layout: "primary", theme: null, tiers: ["elite"], themes: THEMES },
    { title: "Seal micro — All tiers (light)", layout: "seal", theme: "light", tiers: TIERS },
    { title: "Size comparison — Elite primary (light)", layout: "primary", theme: "light", tiers: ["elite"], sizes: SIZES },
  ];

  container.innerHTML = sections
    .map((section) => {
      const layouts = section.layouts || [section.layout || "primary"];
      const themes = section.themes || [section.theme || "light"];
      const tiers = section.tiers || TIERS;
      const sizes = section.sizes || ["md"];

      const cells = [];
      for (const tier of tiers) {
        for (const layout of layouts) {
          for (const theme of themes) {
            for (const size of sizes) {
              const darkCell = theme === "dark";
              cells.push(`
                <div class="ch-crs-badge-lab__cell${darkCell ? " ch-crs-badge-lab__cell--dark" : ""}">
                  ${renderBadgeHtml({ tier, layout, theme, size, showVerifier: true })}
                  <div class="ch-crs-badge-lab__cell-label">${tier} · ${layout} · ${theme}${size !== "md" ? ` · ${size}` : ""}</div>
                </div>
              `);
            }
          }
        }
      }

      return `
        <section class="ch-crs-badge-lab__section">
          <h2 class="ch-crs-badge-lab__section-title">${section.title}</h2>
          <div class="ch-crs-badge-lab__grid">${cells.join("")}</div>
        </section>
      `;
    })
    .join("");
}
