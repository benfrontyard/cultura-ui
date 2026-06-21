/**
 * Badge export controls — SVG and PNG download.
 */
import {
  renderBadgeSvg,
  getExportFilename,
  downloadSvg,
  downloadBlob,
  svgToPngBlob,
  PNG_PRESETS,
} from "./crs-certification-badge.js";

/**
 * @param {HTMLElement} container
 * @param {() => object} getBadgeOpts
 */
export function initBadgeExportControls(container, getBadgeOpts) {
  if (!container) return;

  container.innerHTML = `
    <div class="ch-crs-badge-lab__export-row">
      <button type="button" class="btn btn-outline-primary btn-sm" data-crs-export="svg">
        Download SVG
      </button>
      ${PNG_PRESETS.map(
        (p) =>
          `<button type="button" class="btn btn-outline-secondary btn-sm" data-crs-export="png" data-crs-width="${p.width}">${p.label}</button>`
      ).join("")}
      <div class="form-check form-check-inline ms-2 mb-0">
        <input class="form-check-input" type="checkbox" id="crsExportSolidBg" data-crs-solid-bg />
        <label class="form-check-label small" for="crsExportSolidBg">Solid background (PNG)</label>
      </div>
    </div>
  `;

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-crs-export]");
    if (!btn) return;

    const opts = getBadgeOpts();
    const svg = renderBadgeSvg(opts);
    const format = btn.getAttribute("data-crs-export");

    if (format === "svg") {
      downloadSvg(svg, getExportFilename({ ...opts, format: "svg" }));
      return;
    }

    if (format === "png") {
      const width = Number(btn.getAttribute("data-crs-width")) || 640;
      const solidBg = container.querySelector("[data-crs-solid-bg]")?.checked;
      const background =
        solidBg && opts.theme === "dark"
          ? "#1a2332"
          : solidBg
            ? "#ffffff"
            : "transparent";

      try {
        const blob = await svgToPngBlob(svg, width, { background });
        downloadBlob(blob, getExportFilename({ ...opts, format: "png" }));
      } catch (err) {
        console.error("[crs-badge] PNG export failed:", err);
      }
    }
  });
}

/**
 * @param {HTMLElement} mount
 * @param {object} initialOpts
 */
export function mountBadgeExportControls(mount, initialOpts = {}) {
  let currentOpts = { ...initialOpts };

  initBadgeExportControls(mount, () => currentOpts);

  return {
    update(opts) {
      currentOpts = { ...currentOpts, ...opts };
    },
  };
}
