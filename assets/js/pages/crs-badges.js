/**
 * CRS Badge Lab — internal design/dev reference only.
 */
import { initBadgePreviewPanel, renderBadgeMatrix } from "../components/badge-preview-panel.js";
import { renderBadgeExamplePlacements } from "../components/badge-example-placements.js";

export function initPage() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("dev")) {
    window.location.replace("ui-foundations.html#comp-crs-badges");
    return;
  }

  initBadgePreviewPanel(document.querySelector("[data-crs-preview-panel]"));
  renderBadgeMatrix(document.querySelector("[data-crs-badge-matrix]"));
  renderBadgeExamplePlacements(document.querySelector("[data-crs-placements]"));
}
