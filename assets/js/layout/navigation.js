import { $ } from "../core/dom-utils.js";
import { STORAGE_KEYS } from "../core/constants.js";
import { getCurrentPage } from "../core/page-context.js";

const STORAGE_SIDEBAR = STORAGE_KEYS.sidebar;

export function highlightNav() {
  const current = getCurrentPage();
  let navKey = current;
  if (current === "analyses-detail" || current === "analyses-new") {
    navKey = "analyses";
  } else if (current === "library-certifications" || current === "files") {
    navKey = "library";
  }
  $(".ch-nav-link[data-ch-nav]").each(function () {
    const key = ($(this).attr("data-ch-nav") || "").trim();
    $(this).toggleClass("active ch-nav-active", key === navKey);
  });
  $(".ch-nav-link[data-ch-nav]").removeAttr("aria-current");
  const $match = $(".ch-nav-link[data-ch-nav]").filter(function () {
    return ($(this).attr("data-ch-nav") || "").trim() === navKey;
  });
  if ($match.length) {
    $match.first().attr("aria-current", "page");
  }
}

export function initNavGroups() {
  $(".ch-nav-group").each(function () {
    const $g = $(this);
    const open = $g.find(".ch-nav-link.ch-nav-active, .ch-nav-link.active").length > 0;
    $g.prop("open", open);
  });
}

/**
 * Sidebar collapse with before-paint restore to prevent re-animation on navigation.
 */
export function initSidebarCollapse() {
  const $toggles = $("[data-ch-sidebar-toggle]");
  if (!$toggles.length) return;

  function apply(collapsed, { skipTransition = false } = {}) {
    if (skipTransition) {
      document.body.classList.add("ch-sidebar--restoring");
    }
    $("body").toggleClass("ch-sidebar-collapsed", collapsed);
    $toggles.each(function () {
      $(this)
        .attr("aria-pressed", collapsed ? "true" : "false")
        .attr("aria-expanded", collapsed ? "false" : "true")
        .attr("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    });
    try {
      localStorage.setItem(STORAGE_SIDEBAR, collapsed ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (skipTransition) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.body.classList.remove("ch-sidebar--restoring");
          document.documentElement.classList.remove("ch-sidebar-persist-collapsed");
        });
      });
    }
  }

  const persisted =
    document.documentElement.classList.contains("ch-sidebar-persist-collapsed") ||
    (() => {
      try {
        return localStorage.getItem(STORAGE_SIDEBAR) === "1";
      } catch (e) {
        return false;
      }
    })();

  if (persisted) {
    apply(true, { skipTransition: true });
  }

  $toggles.on("click", function () {
    apply(!$("body").hasClass("ch-sidebar-collapsed"));
  });
}

/** Browser back/forward: disabled when the session cannot traverse that direction. */
export function initTopbarHistoryNav() {
  const $backs = $('[data-ch-history="back"]');
  const $fwds = $('[data-ch-history="forward"]');
  if (!$backs.length && !$fwds.length) return;

  function navigationEntryType() {
    const entries = performance.getEntriesByType && performance.getEntriesByType("navigation");
    return entries && entries[0] ? entries[0].type : "";
  }

  function computeAvailability() {
    const nav = window.navigation;
    if (nav && typeof nav.canGoBack === "boolean" && typeof nav.canGoForward === "boolean") {
      return { back: nav.canGoBack, forward: nav.canGoForward };
    }
    const viaHistoryTraversal = navigationEntryType() === "back_forward";
    return {
      back: window.history.length > 1,
      forward: viaHistoryTraversal,
    };
  }

  function applyState() {
    const caps = computeAvailability();
    $backs.prop("disabled", !caps.back);
    $fwds.prop("disabled", !caps.forward);
  }

  $backs.on("click", function () {
    if (this.disabled) return;
    window.history.back();
  });
  $fwds.on("click", function () {
    if (this.disabled) return;
    window.history.forward();
  });

  window.addEventListener("pageshow", applyState);
  if (window.navigation && typeof window.navigation.addEventListener === "function") {
    try {
      window.navigation.addEventListener("currententrychange", applyState);
    } catch (e) {
      /* ignore */
    }
  }
  applyState();
}

export function initNavDestinations() {
  const folder = document.body.getAttribute("data-ch-folder") || "root";
  let map;
  if (folder === "analyses") {
    map = { blueprint: "espn-detail.html#tab-blueprint" };
  } else if (folder === "nested") {
    map = { blueprint: "../analyses/espn-detail.html#tab-blueprint" };
  } else {
    map = { blueprint: "analyses/espn-detail.html#tab-blueprint" };
  }
  Object.keys(map).forEach(function (key) {
    $(`a[data-ch-nav="${key}"]`).each(function () {
      if (($(this).attr("href") || "#") === "#") {
        $(this).attr("href", map[key]);
      }
    });
  });
}

/** Bootstrap offcanvas mobile drawer — sync aria when shown/hidden. */
export function initMobileDrawer() {
  const drawer = document.getElementById("chNavDrawer");
  if (!drawer || typeof bootstrap === "undefined") return;
  drawer.addEventListener("shown.bs.offcanvas", () => {
    document.body.classList.add("ch-mobile-nav-open");
  });
  drawer.addEventListener("hidden.bs.offcanvas", () => {
    document.body.classList.remove("ch-mobile-nav-open");
  });
}
