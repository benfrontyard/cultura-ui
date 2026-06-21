/**
 * Runs before first paint to avoid layout flash for persisted UI state.
 * Loaded as a classic script from HTML <head> (not an ES module).
 */
(function restoreDataModeBeforePaint() {
  try {
    var mode = localStorage.getItem("ch_data_mode");
    if (mode === "new") {
      document.documentElement.classList.add("ch-data-mode-new");
    } else {
      document.documentElement.classList.add("ch-data-mode-established");
    }
  } catch (e) {
    document.documentElement.classList.add("ch-data-mode-established");
  }
})();

(function restoreAiDockBeforePaint() {
  var dock = document.getElementById("chAiDock");
  if (!dock) return;
  try {
    var raw = sessionStorage.getItem("ch-ai-dock-state");
    if (!raw) return;
    var state = JSON.parse(raw);
    if (state.expanded) {
      dock.classList.remove("ch-ai-dock--collapsed");
      dock.classList.add("ch-ai-dock--expanded");
      dock.setAttribute("aria-expanded", "true");
      document.body.classList.add("ch-ai-dock-expanded", "ch-has-ai-dock");
      if (state.fullscreen) {
        dock.classList.add("ch-ai-dock--fullscreen");
        document.body.classList.add("ch-ai-dock-fullscreen-active");
        document.documentElement.style.setProperty("--ch-ai-dock-offset", "5.5rem");
      } else {
        document.documentElement.style.setProperty(
          "--ch-ai-dock-offset",
          state.threadExpanded ? "22rem" : "14rem"
        );
      }
    } else {
      document.body.classList.add("ch-has-ai-dock");
      document.documentElement.style.setProperty("--ch-ai-dock-offset", "5.5rem");
    }
    dock.classList.add("ch-ai-dock--restoring");
  } catch (e) {
    /* ignore */
  }
})();

(function restoreSidebarBeforePaint() {
  try {
    if (localStorage.getItem("ch-sidebar-collapsed") === "1") {
      document.documentElement.classList.add("ch-sidebar-persist-collapsed");
      document.body.classList.add("ch-sidebar-collapsed", "ch-sidebar--restoring");
    }
  } catch (e) {
    /* ignore */
  }
})();
