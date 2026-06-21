/**
 * Application bootstrap — loads global modules and page-specific inits.
 */
import { initWorkspace } from "../workspace/index.js";
import { initMobileDrawer } from "../layout/navigation.js";

const PAGE_MODULES = {
  home: () => import("../pages/dashboard.js"),
  analyses: () => import("../pages/analyses.js"),
  "analyses-detail": () => import("../pages/analysis-detail.js"),
  "analyses-new": () => import("../pages/new-analysis.js"),
  audiences: () => import("../pages/audiences.js"),
  activations: () => import("../pages/activations.js"),
  library: () => import("../pages/library.js"),
  files: () => import("../pages/library.js"),
  settings: () => import("../pages/settings.js"),
  foundations: () => import("../pages/foundations.js"),
};

async function boot() {
  initMobileDrawer();
  initWorkspace();

  const page = (document.body.getAttribute("data-ch-current") || "").trim();
  const loadPage = PAGE_MODULES[page];
  if (loadPage) {
    try {
      const mod = await loadPage();
      if (typeof mod.initPage === "function") mod.initPage();
    } catch (err) {
      console.warn("[cultura-ui] Page module load skipped:", page, err);
    }
  }
}

boot();
