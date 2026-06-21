/**
 * Workspace behavior migrated from assets/js/app.legacy.js
 */
import { $, domReady, extend, fetchJson, asJQueryPromise } from "../core/dom-utils.js";
import {
  highlightNav as layoutHighlightNav,
  initNavGroups as layoutInitNavGroups,
  initSidebarCollapse as layoutInitSidebarCollapse,
  initTopbarHistoryNav as layoutInitTopbarHistoryNav,
  initNavDestinations as layoutInitNavDestinations,
} from "../layout/navigation.js";

$.extend = extend;
$.getJSON = function getJSON(url) {
  return asJQueryPromise(fetchJson(url));
};
$.Deferred = function Deferred() {
  let resolveFn;
  let rejectFn;
  const promise = new Promise((res, rej) => {
    resolveFn = res;
    rejectFn = rej;
  });
  const deferred = {
    resolve(value) {
      resolveFn(value);
      return deferred;
    },
    reject(value) {
      rejectFn(value);
      return deferred;
    },
    promise() {
      return asJQueryPromise(promise);
    },
  };
  return deferred;
};

var STORAGE_SIDEBAR = "ch-sidebar-collapsed";
  var STORAGE_SESSION = "ch_session";
  var STORAGE_LOCALE = "ch_locale";
  var STORAGE_AI_DOCK = "ch-ai-dock-state";
  var STORAGE_USER_AUDIENCES = "ch_user_audiences";
  var STORAGE_DATA_MODE = "ch_data_mode";
  var AI_DOCK_COLLAPSED_OFFSET = "5.5rem";
  var AI_DOCK_EXPANDED_OFFSET = "14rem";

  var CH_COPY = {
    assistantName: "Cultura AI",
    toastDefault: "Saved.",
    auth: {
      loginLead: "Enter your details to sign in to Culture Hive.",
      signupLead: "Create your Culture Hive account.",
      loginHint: "Sign in with your Culture Hive credentials to access Cultura AI.",
      signupHint: "Your account includes analyses, audiences, and Cultura AI.",
      signedIn: "Signed in. Welcome back.",
      accountCreated: "Account created. Welcome to Culture Hive.",
      passwordReset: "Check your email for a reset link.",
    },
    empty: {
      analyses: "No analyses match your filters",
      activations: "No activations match your filters",
    },
    loading: [
      "Mapping cultural segments",
      "Analyzing audience behaviors",
      "Processing audience signals",
    ],
  };

  function getDataMode() {
    try {
      return localStorage.getItem(STORAGE_DATA_MODE) === "new" ? "new" : "established";
    } catch (e) {
      return "established";
    }
  }

  function isNewAccountMode() {
    return getDataMode() === "new";
  }

  function setDataMode(mode) {
    var next = mode === "new" ? "new" : "established";
    try {
      localStorage.setItem(STORAGE_DATA_MODE, next);
    } catch (e) {
      /* ignore */
    }
    document.documentElement.classList.toggle("ch-data-mode-new", next === "new");
    document.documentElement.classList.toggle("ch-data-mode-established", next !== "new");
  }

  function applyDataModeUi() {
    var isNew = isNewAccountMode();
    $(".ch-command-palette-list a").each(function () {
      var href = ($(this).attr("href") || "").toLowerCase();
      $(this).toggleClass("d-none", isNew && href.indexOf("espn-detail") !== -1);
    });
  }

  function initDataModeSettings() {
    var $toggle = $("#chDataModeSample");
    if (!$toggle.length) return;

    $toggle.prop("checked", !isNewAccountMode());
    $toggle.on("change", function () {
      var established = $(this).is(":checked");
      setDataMode(established ? "established" : "new");
      showToast(
        established
          ? "Showing workspace with sample analyses and files."
          : "Showing new-account empty states.",
        "secondary"
      );
      window.setTimeout(function () {
        window.location.reload();
      }, 350);
    });
  }

  function getCurrentPage() {
    return ($("body").attr("data-ch-current") || "").trim();
  }

  function highlightNav() {
    var current = getCurrentPage();
    var navKey = current;
    if (current === "analyses-detail" || current === "analyses-new") {
      navKey = "analyses";
    }
    $(".ch-nav-link[data-ch-nav]").each(function () {
      var $link = $(this);
      var key = ($link.attr("data-ch-nav") || "").trim();
      $link.toggleClass("active ch-nav-active", key === navKey);
    });
    $(".ch-nav-link[data-ch-nav]").removeAttr("aria-current");
    var $match = $(".ch-nav-link[data-ch-nav]").filter(function () {
      return ($(this).attr("data-ch-nav") || "").trim() === navKey;
    });
    if ($match.length) {
      $match.first().attr("aria-current", "page");
    }
  }

  function initNavGroups() {
    $(".ch-nav-group").each(function () {
      var $g = $(this);
      var open = $g.find(".ch-nav-link.ch-nav-active, .ch-nav-link.active").length > 0;
      $g.prop("open", open);
    });
  }

  function initSidebarCollapse() {
    var $toggles = $("[data-ch-sidebar-toggle]");
    if (!$toggles.length) return;

    function apply(collapsed) {
      $("body").toggleClass("ch-sidebar-collapsed", collapsed);
      $toggles.each(function () {
        var $btn = $(this);
        $btn.attr("aria-pressed", collapsed ? "true" : "false");
        $btn.attr("aria-expanded", collapsed ? "false" : "true");
        $btn.attr("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
      });
      try {
        localStorage.setItem(STORAGE_SIDEBAR, collapsed ? "1" : "0");
      } catch (e) {
        /* ignore */
      }
    }

    try {
      if (localStorage.getItem(STORAGE_SIDEBAR) === "1") {
        apply(true);
      }
    } catch (e) {
      /* ignore */
    }

    $toggles.on("click", function () {
      apply(!$("body").hasClass("ch-sidebar-collapsed"));
    });
  }

  /** Browser back/forward: disabled when the session cannot traverse that direction. */
  function initTopbarHistoryNav() {
    var $backs = $("[data-ch-history=\"back\"]");
    var $fwds = $("[data-ch-history=\"forward\"]");
    if (!$backs.length && !$fwds.length) return;

    function navigationEntryType() {
      var entries = performance.getEntriesByType && performance.getEntriesByType("navigation");
      return entries && entries[0] ? entries[0].type : "";
    }

    function computeAvailability() {
      var nav = window.navigation;
      if (nav && typeof nav.canGoBack === "boolean" && typeof nav.canGoForward === "boolean") {
        return { back: nav.canGoBack, forward: nav.canGoForward };
      }
      var viaHistoryTraversal = navigationEntryType() === "back_forward";
      return {
        back: window.history.length > 1,
        forward: viaHistoryTraversal
      };
    }

    function apply() {
      var caps = computeAvailability();
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

    window.addEventListener("pageshow", apply);
    if (window.navigation && typeof window.navigation.addEventListener === "function") {
      try {
        window.navigation.addEventListener("currententrychange", apply);
      } catch (e) {
        /* ignore */
      }
    }
    apply();
  }

  function initToastDemo() {
    $(document).on("click", "[data-ch-demo-toast]", function (e) {
      e.preventDefault();
      var msg = $(this).attr("data-ch-toast-message") || CH_COPY.toastDefault;
      var variant = $(this).attr("data-ch-toast-variant") || "secondary";
      showToast(msg, variant);
    });
  }

  function showToast(message, variant, options) {
    variant = variant || "primary";
    options = options || {};
    var $host = $("#chToastHost");
    if (!$host.length || typeof bootstrap === "undefined") return;

    var id = "chToast-" + Date.now();
    var actionHtml = "";
    if (options.actionLabel) {
      actionHtml =
        '<button type="button" class="btn btn-sm btn-light fw-semibold me-2 my-auto" data-ch-toast-action>' +
        String(options.actionLabel).replace(/</g, "&lt;") +
        "</button>";
    }
    var html =
      '<div id="' +
      id +
      '" class="toast align-items-center text-bg-' +
      variant +
      ' border-0" role="status" aria-live="polite" aria-atomic="true">' +
      '<div class="d-flex">' +
      '<div class="toast-body">' +
      String(message).replace(/</g, "&lt;") +
      "</div>" +
      actionHtml +
      '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Dismiss notification"></button>' +
      "</div></div>";

    $host.append(html);
    var el = document.getElementById(id);
    if (!el) return;
    var toast = new bootstrap.Toast(el, { delay: options.delay || 4500 });
    if (options.actionLabel && typeof options.onAction === "function") {
      $(el)
        .find("[data-ch-toast-action]")
        .on("click", function () {
          options.onAction();
          toast.hide();
        });
    }
    el.addEventListener(
      "hidden.bs.toast",
      function () {
        $(el).remove();
      },
      { once: true }
    );
    toast.show();
  }

  function initFoundationsPage() {
    if (getCurrentPage() !== "foundations") return;
    var $filter = $("#ch-foundations-filter");
    if ($filter.length) {
      $filter.on("input", function () {
        var q = ($filter.val() || "").trim().toLowerCase();
        $(".ch-foundations-section").each(function () {
          var $sec = $(this);
          var blob = (($sec.attr("id") || "") + " " + $sec.text()).toLowerCase();
          var terms = ($sec.attr("data-ch-foundations-terms") || "").toLowerCase();
          var match = !q || blob.indexOf(q) !== -1 || terms.indexOf(q) !== -1;
          $sec.toggleClass("d-none", !match);
        });
      });
    }
    $(document).on("click", "[data-ch-copy]", function (e) {
      if (getCurrentPage() !== "foundations") return;
      e.preventDefault();
      var raw = ($(this).attr("data-ch-copy") || "").trim();
      if (!raw) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(raw).then(
          function () {
            showToast("Copied to clipboard.", "secondary");
          },
          function () {
            showToast("Copy failed.", "danger");
          }
        );
      } else {
        showToast("Clipboard unavailable in this context.", "warning");
      }
    });
  }

  function initAiGeneratingDemo() {
    $(document).on("click", "[data-ch-ai-generating-toggle]", function (e) {
      e.preventDefault();
      var sel =
        $(this).attr("data-ch-ai-generating-target") || "#chAiGeneratingDemo";
      var $root = $(sel);
      if (!$root.length) return;
      $root.toggleClass("d-none");
    });
  }

  function initDropzoneDemo() {
    $(document).on("dragenter.chdz dragover.chdz", "[data-ch-dropzone]", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).addClass("ch-dropzone-active");
    });

    $(document).on("dragleave.chdz", "[data-ch-dropzone]", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).removeClass("ch-dropzone-active");
    });

    $(document).on("drop.chdz", "[data-ch-dropzone]", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).removeClass("ch-dropzone-active");
    });
  }

  function initMarkedChat() {
    var $target = $("#chMarkdownTarget");
    if (!$target.length || typeof marked === "undefined") return;

    var raw = $("#chMarkdownSource").length
      ? $("#chMarkdownSource").text()
      : $target.attr("data-ch-markdown");
    if (!raw || !String(raw).trim()) return;

    $target.html(marked.parse(String(raw).trim()));
  }

  function hasSession() {
    try {
      return localStorage.getItem(STORAGE_SESSION) === "1";
    } catch (e) {
      return false;
    }
  }

  function setSession(on) {
    try {
      if (on) localStorage.setItem(STORAGE_SESSION, "1");
      else localStorage.removeItem(STORAGE_SESSION);
    } catch (e) {
      /* ignore */
    }
  }

  /** Login vs sign-up panel on #chAuthGate. */
  function setAuthGateMode(mode) {
    var $gate = $("#chAuthGate");
    var $loginView = $("#chAuthLoginView");
    var $signupView = $("#chAuthSignupView");
    if (!$gate.length || !$loginView.length || !$signupView.length) return;
    var isSignup = mode === "signup";
    $loginView.toggleClass("d-none", isSignup);
    $signupView.toggleClass("d-none", !isSignup);
    $gate.attr("data-ch-auth-mode", isSignup ? "signup" : "login");
    var title = document.getElementById("chAuthTitle");
    var lead = document.getElementById("chAuthLead");
    var hint = document.getElementById("chAuthHint");
    if (title) title.textContent = isSignup ? "Sign up" : "Log in";
    if (lead) {
      lead.textContent = isSignup ? CH_COPY.auth.signupLead : CH_COPY.auth.loginLead;
    }
    if (hint) {
      hint.textContent = isSignup ? CH_COPY.auth.signupHint : CH_COPY.auth.loginHint;
    }
  }

  function pauseAuthHeroVideo() {
    var v = document.getElementById("chAuthHeroVideo");
    if (!v || typeof v.pause !== "function") return;
    try {
      v.pause();
    } catch (err) {
      /* ignore */
    }
  }

  function playAuthHeroVideo() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var v = document.getElementById("chAuthHeroVideo");
    if (!v || typeof v.play !== "function") return;
    var p = v.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
  }

  function resetAuthGatePasswordToggles() {
    ["chLoginPassword", "chSignupPassword"].forEach(function (inputId) {
      var input = document.getElementById(inputId);
      if (input) input.setAttribute("type", "password");
    });
    ["chLoginPasswordToggle", "chSignupPasswordToggle"].forEach(function (btnId) {
      var btn = document.getElementById(btnId);
      if (btn) {
        btn.classList.remove("is-revealed");
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", "Show password");
      }
    });
  }

  function applyAuthVisibility() {
    var $gate = $("#chAuthGate");
    var $app = $("#chWorkspaceApp");
    if (!$gate.length || !$app.length) return;

    if (hasSession()) {
      $gate.addClass("d-none").attr("aria-hidden", "true");
      $app.removeClass("d-none").attr("aria-hidden", "false");
      pauseAuthHeroVideo();
    } else {
      $gate.removeClass("d-none").attr("aria-hidden", "false");
      $app.addClass("d-none").attr("aria-hidden", "true");
      playAuthHeroVideo();
    }
  }

  function initAuthGate() {
    if (!$("#chAuthGate").length) return;

    applyAuthVisibility();

    try {
      var params = new URLSearchParams(window.location.search || "");
      if (params.get("ch_auth") === "signup") {
        if (!hasSession()) setAuthGateMode("signup");
        params.delete("ch_auth");
        var rest = params.toString();
        var next = window.location.pathname + (rest ? "?" + rest : "");
        if (typeof history !== "undefined" && history.replaceState) {
          history.replaceState(null, "", next);
        }
      }
    } catch (err) {
      /* ignore */
    }

    $("#chSignupPasswordToggle").on("click", function (e) {
      e.preventDefault();
      var $btn = $(this);
      var $input = $("#chSignupPassword");
      if (!$input.length) return;
      var revealed = $input.attr("type") === "text";
      $input.attr("type", revealed ? "password" : "text");
      $btn.toggleClass("is-revealed", !revealed);
      $btn.attr("aria-pressed", revealed ? "false" : "true");
      $btn.attr("aria-label", revealed ? "Show password" : "Hide password");
    });

    $("#chLoginPasswordToggle").on("click", function (e) {
      e.preventDefault();
      var $btn = $(this);
      var $input = $("#chLoginPassword");
      if (!$input.length) return;
      var revealed = $input.attr("type") === "text";
      $input.attr("type", revealed ? "password" : "text");
      $btn.toggleClass("is-revealed", !revealed);
      $btn.attr("aria-pressed", revealed ? "false" : "true");
      $btn.attr("aria-label", revealed ? "Show password" : "Hide password");
    });

    $("#chLoginForm").on("submit", function (e) {
      e.preventDefault();
      var email = ($("#chLoginEmail").val() || "").trim();
      var password = ($("#chLoginPassword").val() || "").trim();
      if (!email || !password) {
        showToast("Enter your email and password to continue.", "danger");
        return;
      }
      setSession(true);
      applyAuthVisibility();
      showToast(CH_COPY.auth.signedIn, "success");
    });

    $("#chSignupForm").on("submit", function (e) {
      e.preventDefault();
      var email = ($("#chSignupEmail").val() || "").trim();
      var password = ($("#chSignupPassword").val() || "").trim();
      if (!email || !password) {
        showToast("Enter your email and password to continue.", "danger");
        return;
      }
      setSession(true);
      applyAuthVisibility();
      showToast(CH_COPY.auth.accountCreated, "success");
    });

    $(document).on("click", "[data-ch-show-login]", function (e) {
      e.preventDefault();
      setAuthGateMode("login");
    });

    $(document).on("click", "[data-ch-register-placeholder]", function (e) {
      e.preventDefault();
      setAuthGateMode("signup");
    });

    $(document).on("click", "[data-ch-forgot-placeholder]", function (e) {
      e.preventDefault();
      showToast(CH_COPY.auth.passwordReset, "success");
    });
  }

  function initLogout() {
    $(document).on("click", "[data-ch-logout]", function (e) {
      e.preventDefault();
      setSession(false);
      var $gate = $("#chAuthGate");
      if ($gate.length && $("#chWorkspaceApp").length) {
        setAuthGateMode("signup");
        applyAuthVisibility();
        var loginForm = document.getElementById("chLoginForm");
        if (loginForm) loginForm.reset();
        var signupForm = document.getElementById("chSignupForm");
        if (signupForm) signupForm.reset();
        resetAuthGatePasswordToggles();
        showToast("Logged out.", "secondary");
        return;
      }
      showToast("Logged out. Opening sign-up…", "secondary");
      window.location.href = getPagePrefix() + "index.html?ch_auth=signup";
    });
  }

  var audiencePending = null;
  var audienceCatalog = null;
  var audienceCatalogPromise = null;
  var AUDIENCE_BROWSER_PAGE_SIZE = 50;

  function formatAudienceDisplayName(name) {
    return String(name || "")
      .split(/\s+/)
      .map(function (word) {
        return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
      })
      .join(" ");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function getAudienceDataUrl() {
    return getPagePrefix() + "assets/data/audience-types.json";
  }

  function loadAudienceCatalog() {
    if (audienceCatalog) {
      return $.Deferred().resolve(audienceCatalog).promise();
    }
    if (audienceCatalogPromise) return audienceCatalogPromise;
    audienceCatalogPromise = $.getJSON(getAudienceDataUrl())
      .then(function (data) {
        audienceCatalog = data || { audiences: [], categories: [] };
        return audienceCatalog;
      })
      .fail(function () {
        audienceCatalogPromise = null;
      });
    return audienceCatalogPromise;
  }

  function getAudienceCategoryLabel(catalog, categoryId) {
    if (!catalog || !catalog.categories) return "";
    for (var i = 0; i < catalog.categories.length; i++) {
      if (catalog.categories[i].id === categoryId) return catalog.categories[i].label;
    }
    return categoryId;
  }

  function buildAudienceAnalysisUrl(name, userId, catalogId) {
    var extra = {};
    if (userId) extra.audienceId = userId;
    else if (catalogId) extra.audienceId = catalogId;
    else if (name) extra.audience = name;
    return buildNewAnalysisUrl("audience", extra);
  }

  function getCatalogAudienceById(catalog, id) {
    var key = String(id || "").trim();
    if (!key || !catalog || !catalog.audiences) return null;
    for (var i = 0; i < catalog.audiences.length; i++) {
      if (catalog.audiences[i].id === key) return catalog.audiences[i];
    }
    return null;
  }

  function makeUserAudienceId() {
    return "ua_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function readUserAudiences() {
    try {
      var raw = localStorage.getItem(STORAGE_USER_AUDIENCES);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeUserAudiences(items) {
    try {
      localStorage.setItem(STORAGE_USER_AUDIENCES, JSON.stringify(items || []));
    } catch (e) {
      /* ignore */
    }
    $(document).trigger("ch:user-audiences-changed");
  }

  function getUserAudienceById(id) {
    var key = String(id || "").trim();
    if (!key) return null;
    var items = readUserAudiences();
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === key) return items[i];
    }
    return null;
  }

  function normalizeUserAudiencePayload(payload) {
    var name = String((payload && payload.name) || "").trim();
    var description = String((payload && payload.description) || "").trim();
    return {
      name: name,
      description: description,
      source: (payload && payload.source) || "manual",
      basedOn: String((payload && payload.basedOn) || "").trim(),
    };
  }

  function upsertUserAudience(payload) {
    var data = normalizeUserAudiencePayload(payload);
    if (!data.name) return null;

    var items = readUserAudiences();
    var now = new Date().toISOString();
    var id = String((payload && payload.id) || "").trim();
    var existingIndex = -1;

    if (id) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          existingIndex = i;
          break;
        }
      }
    } else {
      for (var j = 0; j < items.length; j++) {
        if ((items[j].name || "").toLowerCase() === data.name.toLowerCase()) {
          existingIndex = j;
          break;
        }
      }
    }

    if (existingIndex >= 0) {
      items[existingIndex] = $.extend({}, items[existingIndex], data, { updatedAt: now });
      writeUserAudiences(items);
      return items[existingIndex];
    }

    var created = $.extend({}, data, {
      id: id || makeUserAudienceId(),
      createdAt: now,
      updatedAt: now,
    });
    items.unshift(created);
    writeUserAudiences(items);
    return created;
  }

  function deleteUserAudience(id) {
    var key = String(id || "").trim();
    if (!key) return false;
    var items = readUserAudiences().filter(function (item) {
      return item.id !== key;
    });
    writeUserAudiences(items);
    return true;
  }

  function getUserAudienceHypothesis(item) {
    if (!item) return "";
    if (item.description) return item.description;
    return item.name || "";
  }

  function syncActiveSegmentsCount() {
    var count = readUserAudiences().length;
    $("[data-ch-active-segments-count]").text(String(count));
  }

  function appendAudienceToHref(href, name) {
    if (!href || !name || href.indexOf("new.html") === -1) return href;
    var url = new URL(href, window.location.href);
    url.searchParams.set("type", "audience");
    url.searchParams.set("audience", name);
    return url.pathname + url.search + url.hash;
  }

  function renderAudienceModalRow(item, opts) {
    opts = opts || {};
    var name = item.name || "";
    var meta = opts.meta ? '<span class="small text-ch-muted">' + escapeHtml(opts.meta) + "</span>" : "";
    return (
      '<li role="presentation" data-ch-audience-source="' +
      escapeAttr(opts.source || "catalog") +
      '">' +
      '<button type="button" class="ch-audience-row w-100 text-start" role="option" aria-selected="false" data-ch-audience-name="' +
      escapeAttr(name) +
      '" data-ch-audience-id="' +
      escapeAttr(item.id || "") +
      '" data-ch-audience-kind="' +
      escapeAttr(opts.source || "catalog") +
      '">' +
      '<span class="d-flex flex-column gap-0">' +
      "<span>" +
      escapeHtml(formatAudienceDisplayName(name)) +
      "</span>" +
      meta +
      "</span>" +
      "</button>" +
      "</li>"
    );
  }

  function renderAudienceModalList(catalog) {
    var $list = $("#chAudienceList");
    if (!$list.length) return;

    var userItems = readUserAudiences();
    var catalogItems = (catalog && catalog.audiences) || [];
    var html = "";

    if (userItems.length) {
      html +=
        '<li class="ch-audience-modal__section" role="presentation">' +
        '<div class="small fw-semibold text-ch-secondary px-1 mb-1">My segments</div>' +
        '<ul class="list-unstyled mb-0 d-flex flex-column gap-1">';
      userItems.forEach(function (item) {
        html += renderAudienceModalRow(item, { source: "user", meta: "Editable · yours" });
      });
      html += "</ul></li>";
    }

    html +=
      '<li class="ch-audience-modal__section" role="presentation">' +
      '<div class="small fw-semibold text-ch-secondary px-1 mb-1">Culture Hive catalog</div>' +
      '<div class="small text-ch-muted px-1 mb-2">Read-only segments curated by Culture Hive.</div>' +
      '<ul class="list-unstyled mb-0 d-flex flex-column gap-1">';
    catalogItems.forEach(function (item) {
      html += renderAudienceModalRow(item, { source: "catalog", meta: "Culture Hive" });
    });
    html += "</ul></li>";

    $list.html(html);
    updateAudienceModalCount(catalogItems.length + userItems.length, catalogItems.length + userItems.length);
  }

  function updateAudienceModalCount(visible, total) {
    var $count = $("#chAudienceModalCount");
    if (!$count.length) return;
    if (visible === total) {
      $count.text(total + " segments");
    } else {
      $count.text(visible + " of " + total + " segments");
    }
  }

  function filterAudienceList(q) {
    var total = 0;
    var visible = 0;
    var emptySections = 0;
    $("#chAudienceList .ch-audience-modal__section").each(function () {
      var sectionVisible = 0;
      $(this)
        .find(".ch-audience-row")
        .each(function () {
          total += 1;
          var t = ($(this).attr("data-ch-audience-name") || "").toLowerCase();
          var desc = ($(this).text() || "").toLowerCase();
          var hide = q.length > 0 && t.indexOf(q) === -1 && desc.indexOf(q) === -1;
          $(this).closest("li[role='presentation']").toggleClass("d-none", hide);
          if (!hide) {
            visible += 1;
            sectionVisible += 1;
          }
        });
      var $section = $(this);
      var hasVisible = sectionVisible > 0;
      $section.toggleClass("d-none", q.length > 0 && !hasVisible);
      if (q.length > 0 && !hasVisible) emptySections += 1;
    });
    updateAudienceModalCount(visible, total);
  }

  function refreshAudiencePicker() {
    loadAudienceCatalog().then(function (catalog) {
      renderAudienceModalList(catalog);
      var q = ($("#chAudienceSearch").val() || "").trim().toLowerCase();
      filterAudienceList(q);
    });
    syncActiveSegmentsCount();
  }

  function initAudienceCatalog() {
    refreshAudiencePicker();
    loadAudienceCatalog().then(function (catalog) {
      if ($("#chAudienceTotalCount").length && catalog.audiences) {
        $("#chAudienceTotalCount").text(String(catalog.audiences.length));
      }
    });
    syncActiveSegmentsCount();
  }

  function initUserAudienceEditor() {
    var editingId = null;

    function openEditor(payload) {
      payload = payload || {};
      editingId = payload.id || null;
      $("#chUserAudienceName").val(payload.name || "");
      $("#chUserAudienceDescription").val(payload.description || "");
      $("#chUserAudienceModalLabel").text(editingId ? "Edit segment" : "Create segment");
      var el = document.getElementById("chUserAudienceModal");
      if (el && typeof bootstrap !== "undefined") {
        bootstrap.Modal.getOrCreateInstance(el).show();
      }
    }

    $(document).on("click", "[data-ch-user-audience-create]", function (e) {
      e.preventDefault();
      openEditor({});
    });

    $(document).on("click", "[data-ch-user-audience-edit]", function (e) {
      e.preventDefault();
      var id = ($(this).attr("data-ch-user-audience-edit") || "").trim();
      var item = getUserAudienceById(id);
      if (!item) {
        showToast("Segment not found.", "warning");
        return;
      }
      openEditor(item);
    });

    $(document).on("click", "[data-ch-user-audience-delete]", function (e) {
      e.preventDefault();
      var id = ($(this).attr("data-ch-user-audience-delete") || "").trim();
      if (!id) return;
      deleteUserAudience(id);
      showToast("Segment removed from My segments.", "secondary");
    });

    $("#chUserAudienceSave").on("click", function () {
      var saved = upsertUserAudience({
        id: editingId,
        name: $("#chUserAudienceName").val(),
        description: $("#chUserAudienceDescription").val(),
        source: "manual",
      });
      if (!saved) {
        showToast("Enter a segment name to save.", "warning");
        return;
      }
      var el = document.getElementById("chUserAudienceModal");
      if (el && typeof bootstrap !== "undefined") {
        var inst = bootstrap.Modal.getInstance(el);
        if (inst) inst.hide();
      }
      showToast(editingId ? "Segment updated." : "Segment added to My segments.", "success");
      editingId = null;
    });

    $(document).on("ch:user-audiences-changed", function () {
      if ($("#ch-audience-browser").length) {
        $(document).trigger("ch:audiences-library-refresh");
      }
      refreshAudiencePicker();
    });
  }

  function initSaveAudienceSegment() {
    $(document).on("click", "[data-ch-save-audience]", function () {
      var $btn = $(this);
      var name =
        ($btn.attr("data-ch-audience-name") || "").trim() ||
        $(".ch-segment-match-bar__value").first().text().trim() ||
        ($("#audience-idea").val() || "").trim();
      var description = ($btn.attr("data-ch-audience-description") || "").trim();
      var basedOn = ($btn.attr("data-ch-based-on") || "").trim();

      var saved = upsertUserAudience({
        name: name,
        description: description,
        basedOn: basedOn,
        source: "analysis",
      });
      if (!saved) {
        showToast("Could not save segment. The name is missing.", "warning");
        return;
      }
      showToast("Saved to My segments. Edit it anytime on the Audiences page.", "success");
    });
  }

  function initAudiencesLibrary() {
    var $browser = $("#ch-audience-browser");
    if (!$browser.length) return;

    var state = {
      q: "",
      category: "all",
      visible: AUDIENCE_BROWSER_PAGE_SIZE,
      myQ: "",
    };

    function getFiltered(catalog) {
      var q = state.q;
      return (catalog.audiences || []).filter(function (item) {
        var matchCategory =
          state.category === "all" ||
          (state.category === "featured" && item.featured) ||
          item.category === state.category;
        var haystack = (item.name + " " + item.category).toLowerCase();
        var matchQuery = !q || haystack.indexOf(q) !== -1;
        return matchCategory && matchQuery;
      });
    }

    function renderCategoryFilters(catalog) {
      var $wrap = $("#chAudienceCategoryFilters");
      if (!$wrap.length) return;

      var chips =
        '<button type="button" class="ch-audience-filter is-active" data-ch-audience-filter="all" aria-pressed="true">All</button>' +
        '<button type="button" class="ch-audience-filter" data-ch-audience-filter="featured" aria-pressed="false">Featured</button>';

      (catalog.categories || []).forEach(function (cat) {
        chips +=
          '<button type="button" class="ch-audience-filter" data-ch-audience-filter="' +
          escapeAttr(cat.id) +
          '" aria-pressed="false">' +
          escapeHtml(cat.label) +
          "</button>";
      });

      $wrap.html(chips);
    }

    function renderBrowserList(catalog) {
      var filtered = getFiltered(catalog);
      var slice = filtered.slice(0, state.visible);
      var $list = $("#chAudienceBrowserList");
      var categoryLabels = {};

      (catalog.categories || []).forEach(function (cat) {
        categoryLabels[cat.id] = cat.label;
      });

      $list.empty();
      slice.forEach(function (item) {
        var categoryLabel = categoryLabels[item.category] || getAudienceCategoryLabel(catalog, item.category);
        var analysisHref = buildAudienceAnalysisUrl(item.name, null, item.id);
        $list.append(
          '<li class="list-group-item d-flex justify-content-between align-items-center gap-3 ch-audience-browser__row" role="button" tabindex="0" data-ch-audience-row data-ch-audience-href="' +
            escapeAttr(analysisHref) +
            '" aria-label="Start analysis for ' +
            escapeAttr(formatAudienceDisplayName(item.name)) +
            '">' +
            '<div class="min-w-0">' +
            '<div class="fw-semibold">' +
            escapeHtml(formatAudienceDisplayName(item.name)) +
            "</div>" +
            '<div class="small text-ch-secondary mb-0">' +
            escapeHtml(categoryLabel) +
            " · Culture Hive · read-only</div>" +
            "</div>" +
            '<a href="' +
            escapeAttr(analysisHref) +
            '" class="btn btn-sm btn-outline-primary flex-shrink-0">Start analysis</a>' +
            "</li>"
        );
      });

      var showing = Math.min(state.visible, filtered.length);
      $("#chAudienceCount").text(showing + " of " + filtered.length + " shown");
      $("#chAudienceEmpty").toggleClass("d-none", filtered.length > 0);
      $list.toggleClass("d-none", filtered.length === 0);
      $("#chAudienceShowMore").toggleClass("d-none", state.visible >= filtered.length || filtered.length === 0);
    }

    loadAudienceCatalog().then(function (catalog) {
      renderCategoryFilters(catalog);
      renderBrowserList(catalog);

      $("#chAudienceBrowserSearch").on("input", function () {
        state.q = ($(this).val() || "").trim().toLowerCase();
        state.visible = AUDIENCE_BROWSER_PAGE_SIZE;
        renderBrowserList(catalog);
      });

      $browser.on("click", "[data-ch-audience-filter]", function () {
        $browser.find("[data-ch-audience-filter]").removeClass("is-active").attr("aria-pressed", "false");
        $(this).addClass("is-active").attr("aria-pressed", "true");
        state.category = ($(this).attr("data-ch-audience-filter") || "all").trim();
        state.visible = AUDIENCE_BROWSER_PAGE_SIZE;
        renderBrowserList(catalog);
      });

      $("#chAudienceShowMore").on("click", function () {
        state.visible += AUDIENCE_BROWSER_PAGE_SIZE;
        renderBrowserList(catalog);
      });

      $browser.on("click", "[data-ch-audience-row]", function (e) {
        if ($(e.target).closest("a, button").length) return;
        var href = ($(this).attr("data-ch-audience-href") || "").trim();
        if (href) window.location.href = href;
      });

      $browser.on("keydown", "[data-ch-audience-row]", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        if ($(e.target).closest("a, button").length) return;
        e.preventDefault();
        var href = ($(this).attr("data-ch-audience-href") || "").trim();
        if (href) window.location.href = href;
      });
    });

    function renderMySegmentsList() {
      var q = state.myQ;
      var items = readUserAudiences().filter(function (item) {
        var haystack = ((item.name || "") + " " + (item.description || "")).toLowerCase();
        return !q || haystack.indexOf(q) !== -1;
      });
      var $list = $("#chMyAudienceList");
      var $empty = $("#chMyAudienceEmpty");
      if (!$list.length) return;

      $list.empty();
      items.forEach(function (item) {
        var desc = item.description
          ? '<div class="small text-ch-secondary mb-0 text-truncate">' + escapeHtml(item.description) + "</div>"
          : '<div class="small text-ch-muted mb-0">No description</div>';
        $list.append(
          '<li class="list-group-item d-flex justify-content-between align-items-center gap-3" data-ch-my-audience-row>' +
            '<div class="min-w-0 flex-grow-1">' +
            '<div class="d-flex flex-wrap align-items-center gap-2 mb-1">' +
            '<div class="fw-semibold">' +
            escapeHtml(formatAudienceDisplayName(item.name)) +
            "</div>" +
            '<span class="ch-pill ch-pill-info">Yours</span>' +
            "</div>" +
            desc +
            "</div>" +
            '<div class="d-flex flex-wrap align-items-center gap-2 flex-shrink-0">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" data-ch-user-audience-edit="' +
            escapeAttr(item.id) +
            '">Edit</button>' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" data-ch-user-audience-delete="' +
            escapeAttr(item.id) +
            '">Delete</button>' +
            '<a href="' +
            escapeAttr(buildAudienceAnalysisUrl(getUserAudienceHypothesis(item), item.id)) +
            '" class="btn btn-sm btn-outline-primary">Start analysis</a>' +
            "</div>" +
            "</li>"
        );
      });

      $("#chMyAudienceCount").text(items.length + " segment" + (items.length === 1 ? "" : "s"));
      $empty.toggleClass("d-none", items.length > 0);
      $list.toggleClass("d-none", items.length === 0);
    }

    renderMySegmentsList();

    $("#chMyAudienceSearch").on("input", function () {
      state.myQ = ($(this).val() || "").trim().toLowerCase();
      renderMySegmentsList();
    });

    $(document).on("ch:audiences-library-refresh", renderMySegmentsList);

    $(document).on("shown.bs.tab", "[data-ch-audience-tab]", function () {
      if (($(this).attr("data-ch-audience-tab") || "") === "mine") renderMySegmentsList();
    });
  }

  var NEW_ANALYSIS_INPUT_TYPES = ["domain", "app", "brief", "creative", "audience"];

  function normalizeNewAnalysisInputType(type) {
    var key = (type || "").trim();
    if (key === "bundle") return "app";
    return NEW_ANALYSIS_INPUT_TYPES.indexOf(key) !== -1 ? key : "";
  }

  function buildNewAnalysisUrl(type, extraParams) {
    var href = getPagePrefix() + "analyses/new.html";
    var params = new URLSearchParams();
    var normalized = normalizeNewAnalysisInputType(type);
    if (normalized) params.set("type", normalized);
    if (extraParams) {
      Object.keys(extraParams).forEach(function (key) {
        var val = extraParams[key];
        if (val != null && String(val).trim()) params.set(key, String(val).trim());
      });
    }
    var qs = params.toString();
    return qs ? href + "?" + qs : href;
  }

  function applyNewAnalysisDeepLink() {
    if (!$("#page-new-analysis").length) return;
    var params = new URLSearchParams(window.location.search || "");
    var type = normalizeNewAnalysisInputType(params.get("type"));
    var audience = (params.get("audience") || "").trim();
    var audienceId = (params.get("audienceId") || "").trim();
    if (!type && !audience && !audienceId) return;

    if (type === "audience" || audience || audienceId) {
      selectNewAnalysisInputType("audience");
      if (audienceId) {
        var saved = getUserAudienceById(audienceId);
        if (saved) {
          $("#audience-idea").val(getUserAudienceHypothesis(saved));
          showToast(
            "Loaded " + formatAudienceDisplayName(saved.name) + " from My segments.",
            "success"
          );
          return;
        }
        loadAudienceCatalog().then(function (catalog) {
          var cat = getCatalogAudienceById(catalog, audienceId);
          if (cat) {
            $("#audience-idea").val(cat.name);
            showToast(
              "Loaded " + formatAudienceDisplayName(cat.name) + " from Audiences.",
              "success"
            );
          } else {
            showToast("Segment not found. It may have been removed from the catalog.", "warning");
          }
        });
      } else if (audience) {
        $("#audience-idea").val(audience);
        showToast("Loaded audience from Audiences.", "success");
      }
      return;
    }

    if (type) selectNewAnalysisInputType(type);
  }

  function initAudienceGate() {
    var $modal = $("#chAudienceModal");

    $(document).on("click", "a[data-ch-audience-gate]", function (e) {
      var $a = $(this);
      if ($a.hasClass("disabled") || $a.attr("aria-disabled") === "true") return;

      e.preventDefault();

      if (!$modal.length) {
        if (typeof bootstrap !== "undefined") {
          showToast("Audience selection is unavailable on this page.", "warning");
        } else {
          window.alert("Audience selection is unavailable on this page.");
        }
        return;
      }

      if (typeof bootstrap === "undefined") {
        window.alert("Audience selection requires Bootstrap JavaScript.");
        return;
      }

      var modal = bootstrap.Modal.getOrCreateInstance($modal[0]);
      audiencePending = {
        href: $a.attr("data-ch-post-select-href") || "",
        modalSelector: ($a.attr("data-ch-post-select-modal") || "").trim(),
      };
      $("#chAudienceSearch").val("");
      refreshAudiencePicker();
      $modal.find(".ch-audience-row.is-active").removeClass("is-active");
      $modal.find(".ch-audience-row").attr("aria-selected", "false");
      modal.show();
    });

    if (!$modal.length || typeof bootstrap === "undefined") return;

    var modal = bootstrap.Modal.getOrCreateInstance($modal[0]);

    $("#chAudienceSearch").on("input", function () {
      filterAudienceList(($(this).val() || "").trim().toLowerCase());
    });

    $modal.on("click", ".ch-audience-row", function () {
      $modal.find(".ch-audience-row").removeClass("is-active").attr("aria-selected", "false");
      $(this).addClass("is-active").attr("aria-selected", "true");
    });

    $("#chAudienceContinue").on("click", function () {
      var $active = $modal.find(".ch-audience-row.is-active");
      if (!$active.length) {
        showToast("Select an audience to continue.", "warning");
        return;
      }
      var name = ($active.attr("data-ch-audience-name") || "").trim();
      var audienceId = ($active.attr("data-ch-audience-id") || "").trim();
      var kind = ($active.attr("data-ch-audience-kind") || "").trim();
      modal.hide();
      if (audiencePending && audiencePending.modalSelector) {
        var $m = $(audiencePending.modalSelector);
        if ($m.length) bootstrap.Modal.getOrCreateInstance($m[0]).show();
      } else if (audiencePending && audiencePending.href) {
        if (kind === "user" && audienceId) {
          var url = new URL(audiencePending.href, window.location.href);
          url.searchParams.set("type", "audience");
          url.searchParams.set("audienceId", audienceId);
          window.location.href = url.pathname + url.search + url.hash;
        } else {
          window.location.href = appendAudienceToHref(audiencePending.href, name);
        }
      } else if (kind === "user" && audienceId) {
        window.location.href = buildAudienceAnalysisUrl("", audienceId);
      } else if (name) {
        window.location.href = buildAudienceAnalysisUrl(name);
      }
      audiencePending = null;
    });
  }

  function getPrototypeMarkdownSource() {
    var $src = $("#chMarkdownSource");
    if (!$src.length) return "";
    return String($src.text() || "").trim();
  }

  var chatSession = {
    generating: false,
    token: 0,
    history: [],
    lastTopic: "",
  };

  function prefersReducedChatMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function escapeChatHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getChatAssetSrc(filename) {
    var folder = ($("body").attr("data-ch-folder") || "").trim();
    var prefix = folder === "analyses" ? "../" : "";
    if (!prefix) {
      var path = window.location.pathname || "";
      if (path.indexOf("/processed-csvs/") !== -1 || path.indexOf("/chat/") !== -1) {
        prefix = "../";
      }
    }
    return prefix + "assets/img/" + filename;
  }

  function buildChatAuthorHtml(role) {
    if (role === "user") {
      return "";
    }
    var icon = getChatAssetSrc("cultura-icon.png");
    return (
      '<div class="ch-chat-author ch-chat-author--assistant">' +
      '<img src="' +
      icon +
      '" alt="" class="ch-chat-author__avatar" width="24" height="24" decoding="async" />' +
      '<span class="ch-chat-author__name">' + CH_COPY.assistantName + "</span>" +
      "</div>"
    );
  }

  function chatFeedbackIcon(name) {
    if (name === "copy") {
      return '<svg class="ch-icon ch-icon--sm" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    }
    if (name === "up") {
      return '<svg class="ch-icon ch-icon--sm" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M7 10v11M7 10l4-4 4 4M7 10H3v11h18V10h-4"/></svg>';
    }
    return '<svg class="ch-icon ch-icon--sm" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 14V3M17 14l-4 4-4-4M17 14h4V3H3v11h4"/></svg>';
  }

  function appendChatMessageFeedback($bubble, plainText) {
    var $fb = $(
      '<div class="ch-chat-feedback" role="group" aria-label="Message actions">' +
        '<button type="button" class="ch-chat-feedback__btn" data-ch-chat-copy aria-label="Copy response">' +
        chatFeedbackIcon("copy") +
        "</button>" +
        '<button type="button" class="ch-chat-feedback__btn" data-ch-chat-up aria-label="Helpful">' +
        chatFeedbackIcon("up") +
        "</button>" +
        '<button type="button" class="ch-chat-feedback__btn" data-ch-chat-down aria-label="Not helpful">' +
        chatFeedbackIcon("down") +
        "</button>" +
        "</div>"
    );
    $bubble.append($fb);
    $fb.find("[data-ch-chat-copy]").on("click", function () {
      var text = String(plainText || "").trim();
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast("Copied to clipboard", "secondary");
        });
      }
    });
    $fb.find("[data-ch-chat-up], [data-ch-chat-down]").on("click", function () {
      $fb.find("[data-ch-chat-up], [data-ch-chat-down]").removeClass("ch-chat-feedback__btn--active");
      $(this).addClass("ch-chat-feedback__btn--active");
    });
  }

  function scrollChatToEnd($scroll) {
    var el = $scroll && $scroll.length ? $scroll[0] : null;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  function appendChatUserBubble($scroll, text) {
    var $bubble = $('<div class="ch-chat-bubble ch-chat-bubble-user ch-chat-bubble--appear"></div>');
    $bubble.append(
      '<div class="ch-chat-bubble-user__row">' +
        '<div class="ch-chat-bubble__body"><p class="mb-0">' +
        escapeChatHtml(text) +
        "</p></div>" +
        '<div class="ch-chat-bubble-user__avatar" aria-hidden="true">NC</div>' +
        "</div>"
    );
    $scroll.append($bubble);
    scrollChatToEnd($scroll);
  }

  function appendChatAssistantActions($bubble) {
    var $actions = $('<div class="ch-chat-actions" role="group" aria-label="Message actions"></div>');
    ["Save", "Export", "Create Persona", "Create Report"].forEach(function (label) {
      $actions.append(
        $('<button type="button" class="btn btn-sm btn-light border ch-chat-actions__btn"></button>').text(label)
      );
    });
    $bubble.append($actions);
  }

  function estimateTypingDelay(content) {
    var len = (content || "").length;
    return Math.min(2600, Math.max(650, 480 + len * 7));
  }

  function appendChatTypingIndicator($scroll) {
    var $el = $(
      '<div class="ch-chat-typing ch-chat-bubble--appear" role="status" aria-live="polite" aria-label="' + CH_COPY.assistantName + ' is typing">' +
        buildChatAuthorHtml("assistant") +
        '<span class="ch-chat-typing__dots" aria-hidden="true"><span></span><span></span><span></span></span>' +
        "</div>"
    );
    $scroll.append($el);
    scrollChatToEnd($scroll);
    return $el;
  }

  function streamHtmlIntoElement($el, html, onDone) {
    var $parsed = $("<div/>").html(html);
    var $chunks = $parsed.children();
    if (!$chunks.length) {
      $el.html(html);
      if (onDone) onDone();
      return;
    }
    var idx = 0;
    function step() {
      if (idx >= $chunks.length) {
        if (onDone) onDone();
        return;
      }
      $el.append($chunks.eq(idx).clone());
      idx += 1;
      scrollChatToEnd($el.closest(".ch-chat-scroll"));
      setTimeout(step, prefersReducedChatMotion() ? 0 : 40 + Math.floor(Math.random() * 45));
    }
    step();
  }

  function formatChatInline(text) {
    var parts = String(text).split(/\*\*([^*]+)\*\*/g);
    var html = "";
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        html += "<strong>" + escapeChatHtml(parts[i]) + "</strong>";
        continue;
      }
      var seg = parts[i].split(/\*([^*]+)\*/g);
      for (var j = 0; j < seg.length; j++) {
        if (j % 2 === 1) html += "<em>" + escapeChatHtml(seg[j]) + "</em>";
        else html += escapeChatHtml(seg[j]);
      }
    }
    return html;
  }

  function renderChatMarkdown(md) {
    if (typeof marked !== "undefined") {
      return marked.parse(String(md || ""));
    }
    var lines = String(md || "").split("\n");
    var out = [];
    var inUl = false;
    var inOl = false;

    function closeLists() {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
    }

    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed) {
        closeLists();
        return;
      }
      if (trimmed.indexOf("### ") === 0) {
        closeLists();
        out.push("<h3>" + formatChatInline(trimmed.slice(4)) + "</h3>");
        return;
      }
      if (trimmed.indexOf("## ") === 0) {
        closeLists();
        out.push("<p class=\"ch-chat-markdown__lead\">" + formatChatInline(trimmed.slice(3)) + "</p>");
        return;
      }
      if (trimmed.indexOf("> ") === 0) {
        closeLists();
        out.push("<blockquote><p>" + formatChatInline(trimmed.slice(2)) + "</p></blockquote>");
        return;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        if (!inOl) {
          closeLists();
          out.push("<ol>");
          inOl = true;
        }
        out.push("<li>" + formatChatInline(trimmed.replace(/^\d+\.\s+/, "")) + "</li>");
        return;
      }
      if (trimmed.indexOf("- ") === 0) {
        if (!inUl) {
          closeLists();
          out.push("<ul>");
          inUl = true;
        }
        out.push("<li>" + formatChatInline(trimmed.slice(2)) + "</li>");
        return;
      }
      closeLists();
      out.push("<p>" + formatChatInline(trimmed) + "</p>");
    });
    closeLists();
    return out.join("");
  }

  function maybeAddChatExpandToggle($wrap) {
    if ($wrap.closest(".ch-ai-dock__thread").length) return;
    var $body = $wrap.find(".ch-chat-markdown__stream").first();
    if (!$body.length) return;
    window.requestAnimationFrame(function () {
      if ($body[0].scrollHeight <= 300) return;
      $wrap.addClass("ch-chat-markdown--collapsed");
      var expanded = false;
      var $btn = $('<button type="button" class="ch-chat-expand-btn btn btn-link btn-sm p-0">Show more</button>');
      $btn.on("click", function () {
        expanded = !expanded;
        $wrap.toggleClass("ch-chat-markdown--collapsed", !expanded);
        $wrap.toggleClass("ch-chat-markdown--expanded", expanded);
        $btn.text(expanded ? "Show less" : "Show more");
        scrollChatToEnd($wrap.closest(".ch-chat-scroll"));
      });
      $wrap.append($btn);
    });
  }

  function buildAssistantHtml(options) {
    if (options.html) return options.html;
    if (options.markdown) {
      return renderChatMarkdown(options.markdown);
    }
    return "<p class=\"mb-0\">" + escapeChatHtml(options.text || "") + "</p>";
  }

  function deliverChatAssistantReply($scroll, options) {
    options = options || {};
    var token = ++chatSession.token;
    var raw = options.markdown || options.text || options.html || "";
    var html = buildAssistantHtml(options);
    var $typing = appendChatTypingIndicator($scroll);
    var delay = prefersReducedChatMotion() ? 100 : estimateTypingDelay(raw);

    return new Promise(function (resolve) {
      setTimeout(function () {
        if (token !== chatSession.token) {
          $typing.remove();
          resolve(null);
          return;
        }
        $typing.remove();

        var $bubble = $('<div class="ch-chat-bubble ch-chat-bubble-assistant ch-chat-bubble--appear"></div>');
        $bubble.append(buildChatAuthorHtml("assistant"));
        var $wrap = $('<div class="ch-chat-markdown ch-chat-markdown--collapsible"></div>');
        var $body = $('<div class="ch-chat-markdown__stream"></div>');
        $wrap.append($body);
        $bubble.append($('<div class="ch-chat-bubble__body"></div>').append($wrap));
        $scroll.append($bubble);
        scrollChatToEnd($scroll);

        function finish() {
          maybeAddChatExpandToggle($wrap);
          if ($scroll.closest(".ch-ai-dock__thread").length) {
            appendChatMessageFeedback($bubble, $body.text().trim());
          } else if (options.actions) {
            appendChatAssistantActions($bubble);
          }
          scrollChatToEnd($scroll);
          resolve($bubble);
        }

        if (prefersReducedChatMotion()) {
          $body.html(html);
          finish();
          return;
        }

        streamHtmlIntoElement($body, html, finish);
      }, delay);
    });
  }

  function appendChatAssistantBubble($scroll, options) {
    return deliverChatAssistantReply($scroll, options || {});
  }

  function getFullChatReply(text) {
    var t = (text || "").toLowerCase().trim();
    var topic = "";

    if (
      t.indexOf("crs") !== -1 &&
      (t.indexOf("explain") !== -1 || t.indexOf("how") !== -1 || t.indexOf("work") !== -1 || t.indexOf("scoring") !== -1)
    ) {
      topic = "crs";
      return {
        topic: topic,
        markdown:
          "## How CRS scoring works\n\n" +
          "**Cultural Relevance Score (CRS)** measures how well a publisher, app, or creative fits a target audience's cultural context, not just demographics.\n\n" +
          "### Four dimensions\n" +
          "1. **Audience alignment** (40%): Does the environment reach your segment with intent?\n" +
          "2. **Editorial / UX signals** (30%): Mobile patterns, content depth, daily-use rituals.\n" +
          "3. **Ownership & authenticity** (15%): Credible voice, community features, bilingual paths.\n" +
          "4. **Intersectional representation** (15%): Sustained coverage beyond tokenism.\n\n" +
          "Each dimension earns points up to its category cap. Cultura sums contributions into a **0–100 verdict** with evidence you can defend to buyers.\n\n" +
          "> **Tip:** A CRS of **75+** is generally activation-ready for multicultural sports audiences when inventory and persona alignment are confirmed.\n\n" +
          "**Next step:** Open **[New Analysis](" + getPagePrefix() + "analyses/new.html)** to score your next domain or brief.",
        actions: false,
      };
    }

    if (t.indexOf("defend") !== -1 || (t.indexOf("buyer") !== -1 && t.indexOf("score") !== -1)) {
      topic = "defend";
      return {
        topic: topic,
        markdown:
          "## Defending CRS 82 to a media buyer\n\n" +
          "**Headline:** ESPN.com is a *strong* environment for Latino millennial sports fans, not a general-market sports play.\n\n" +
          "### Why 82 holds up\n" +
          "- **Audience alignment (+32):** High-intent sports rituals (scores, highlights, fantasy) match daily mobile behavior.\n" +
          "- **Ownership (+20):** Credible sports authority with growing Spanish-language verticals.\n" +
          "- **Editorial/UX (+18):** Mobile-first feeds and clip culture support habitual visits.\n" +
          "- **Representation (+12):** Latino athlete narratives across soccer, baseball, and basketball.\n\n" +
          "### How to position it\n" +
          "Pair ESPN with **Spanish-language sports publishers** for incremental reach. Lead with bilingual creative and highlight-adjacent placements during key match windows, not generic team logos.\n\n" +
          "**Objection handler:** *\"Isn't ESPN general market?\"* For this segment, ESPN over-indexes on bilingual paths, athlete storytelling, and sports-native engagement.\n\n" +
          "**Next step:** Open the **Blueprint** tab to export a client-ready summary.",
        actions: false,
      };
    }

    if (t.indexOf("summarize") !== -1 || (t.indexOf("client") !== -1 && t.indexOf("espn") !== -1)) {
      topic = "client-summary";
      return {
        topic: topic,
        markdown:
          "## Client summary: ESPN.com Evaluation\n\n" +
          "**Verdict:** CRS **82**, strong cultural relevance for **Latino millennial sports fans**.\n\n" +
          "**Why it works:** ESPN combines credible sports authority with bilingual coverage and athlete-led storytelling in high-intent environments (mobile web, CTV apps).\n\n" +
          "**Recommended next steps:**\n" +
          "- Curate **13-domain inventory** with Spanish-language sports extensions\n" +
          "- Use persona-led creative (Diego Ramirez profile) emphasizing family fandom and authentic representation\n" +
          "- Plan for **awareness + engagement** with highlight-adjacent units during live windows\n\n" +
          "**Caveat to flag:** Intersectional visibility (women's sports, LGBTQ+ coverage) is improving but uneven; note as a watch item, not a blocker.\n\n" +
          "**Next step:** Click **Generate Client Summary** on the Blueprint tab to export this narrative.",
        actions: true,
      };
    }

    if (t.indexOf("cultural risk") !== -1 || (t.indexOf("risk") !== -1 && t.indexOf("sport") !== -1)) {
      topic = "risks";
      return {
        topic: topic,
        markdown:
          "## Cultural risks in sports campaigns\n\n" +
          "Watch for these patterns when planning around sports audiences:\n\n" +
          "1. **Heritage-only casting**: Leading with flags or stereotypes instead of lived sports rituals.\n" +
          "2. **Single-sport tokenism**: Assuming soccer alone represents all Latino fandom.\n" +
          "3. **English-only CTA on bilingual environments**: Friction on publishers with strong Spanish paths.\n" +
          "4. **Highlight theft**: Creative that crops athletes out of community context.\n" +
          "5. **Event-only bursts**: World Cup or Olympics spikes without sustained narrative coverage.\n\n" +
          "**Mitigation:** Anchor on athlete journeys, family viewing moments, and bilingual highlight culture. Validate creative against your persona's *Creative Alignment Notes* before flight.\n\n" +
          "**Next step:** Open the **Audience** tab on your analysis to review creative alignment notes for Diego Ramirez.",
        actions: false,
      };
    }

    if (
      t.indexOf("new analysis") !== -1 ||
      t.indexOf("create analysis") !== -1 ||
      t.indexOf("start analysis") !== -1 ||
      t.indexOf("run analysis") !== -1
    ) {
      topic = "workflow";
      return {
        topic: topic,
        markdown:
          "## Start a structured analysis\n\n" +
          "Chat doesn’t create saved evaluations. To officially score a domain, brief, or creative:\n\n" +
          "1. Open **[New Analysis](" + getPagePrefix() + "analyses/new.html)**\n" +
          "2. Choose your input type (Domain, Brief, Creative, etc.)\n" +
          "3. Click **Generate Analysis**\n\n" +
          "You’ll get a CRS verdict, evidence cards, inventory, and activation steps, all tracked in your **Analyses** list.",
        actions: false,
      };
    }

    if (t.indexOf("analyze next") !== -1 || t.indexOf("what should i analyze") !== -1) {
      topic = "next";
      return {
        topic: topic,
        markdown:
          "## What to analyze next\n\n" +
          "Based on your workspace, I'd prioritize:\n\n" +
          "1. **ESPN.com Evaluation (CRS 82)**: Activation-ready. Review inventory → customize campaign plan → create deal ID.\n" +
          "2. **Nike Summer Brief (CRS 71)**: Strong for Gen Z athleisure; check stereotype flags before client send.\n" +
          "3. **Tubi Creative Review (CRS 68)**: In review; good candidate for creative iteration before scale.\n\n" +
          "If you're starting fresh, evaluate a **competitive publisher** in the same vertical to compare CRS deltas, or upload a **campaign brief** to extract audience signals before picking inventory.",
        actions: false,
      };
    }

    if (t.indexOf("inventory") !== -1 || t.indexOf("domain") !== -1) {
      topic = "inventory";
      return {
        topic: topic,
        markdown:
          "## Inventory guidance\n\n" +
          "For ESPN.com Evaluation, Cultura curated **13 domains** spanning ESPN digital, Spanish-language sports, and community publishers.\n\n" +
          "- **Keep:** High-intent sports environments with bilingual content paths.\n" +
          "- **Consider adding:** Regional soccer and baseball community sites for incremental authenticity.\n" +
          "- **Exclude:** General news without sports-native UX unless layered with strict contextual targeting.\n\n" +
          "Open the **Inventory** tab to toggle selections, then move to **Campaign Plan** when the mix totals align with your budget scenario.",
        actions: false,
      };
    }

    if (t.indexOf("persona") !== -1 || t.indexOf("diego") !== -1 || t.indexOf("audience") !== -1) {
      topic = "persona";
      return {
        topic: topic,
        markdown:
          "## Persona: Diego Ramirez\n\n" +
          "**Profile:** 25–34 · Latino millennial · sports-first\n\n" +
          "**Resonates with:** Authentic athlete stories, bilingual highlights, family-centered game-day rituals.\n" +
          "**Avoid:** Over-polished corporate tone; heritage clichés without sports context.\n\n" +
          "**Channels:** CTV apps (ESPN+, Hulu Live), Instagram, TikTok. Mobile-first highlight consumption.\n\n" +
          "Use this persona to stress-test creative and to filter inventory toward environments that match daily sports behavior, not just demographic labels.\n\n" +
          "**Next step:** Save this segment to **My segments** on the Audience tab, then start a **New Analysis** with the audience lens applied.",
        actions: false,
      };
    }

    if (t.indexOf("thank") !== -1 || t === "ty" || t === "thanks") {
      return {
        topic: "thanks",
        text: "You're welcome. When you're ready, pick a next step from your analysis (inventory, campaign plan, or activation) and I can help you pressure-test the rationale.",
        actions: false,
      };
    }

    if (t.indexOf("more") !== -1 || t.indexOf("elaborate") !== -1 || t.indexOf("detail") !== -1) {
      if (chatSession.lastTopic === "crs") {
        return getFullChatReply("Explain how CRS scoring works");
      }
      if (chatSession.lastTopic === "defend") {
        return getFullChatReply("Help me defend a CRS score of 82 to a media buyer");
      }
      if (chatSession.lastTopic === "client-summary") {
        return getFullChatReply("Summarize the ESPN.com analysis for a client");
      }
    }

    var blueprint = getPrototypeMarkdownSource();
    if (blueprint && (t.indexOf("blueprint") !== -1 || t.indexOf("sustainable") !== -1 || t.indexOf("home shopper") !== -1)) {
      topic = "blueprint";
      return { topic: topic, markdown: blueprint, actions: true };
    }

    return null;
  }

  function getAssistantReply(text, opts) {
    opts = opts || {};
    var ctx = opts.context || $("body").attr("data-ch-copilot-context") || "";
    var page = getCurrentPage();

    if (page === "ai-chat" || opts.preferRich) {
      var rich = getFullChatReply(text);
      if (rich) {
        if (rich.topic) chatSession.lastTopic = rich.topic;
        return rich;
      }
      chatSession.lastTopic = "general";
      return {
        markdown:
          "I can help with **CRS scoring**, **client-ready summaries**, **inventory curation**, and **activation planning**.\n\n" +
          "Try asking:\n" +
          "- *Explain how CRS scoring works*\n" +
          "- *Summarize the ESPN.com analysis for a client*\n" +
          "- *What cultural risks should I watch for in sports campaigns?*\n\n" +
          "When you are ready to score a domain, brief, or creative, start from **[New Analysis](" + getPagePrefix() + "analyses/new.html)**, which creates a saved evaluation in your workspace.",
        actions: false,
      };
    }

    var dockText = copilotReplyForMessage(text, ctx);
    if (dockText.length > 320 && typeof marked !== "undefined") {
      return { markdown: dockText, actions: false };
    }
    return { text: dockText, actions: false };
  }

  function activateChatThread($page, $threadSection) {
    if (!$page.length || $page.hasClass("ch-chat-page--active")) return;
    $page.addClass("ch-chat-page--active");
    if ($threadSection.length) $threadSection.attr("aria-hidden", "false");
    $(".ch-chat-page-empty").attr("aria-hidden", "true");
  }

  function syncDockThreadToggleUi(expanded) {
    var $btn = $("[data-ch-dock-thread-expand]");
    if (!$btn.length) return;
    $btn.attr("aria-expanded", expanded ? "true" : "false");
    $btn.attr("aria-label", expanded ? "Collapse conversation" : "Expand conversation");
    $btn.find("use").attr("href", expanded ? "#ch-chevron-down" : "#ch-chevron-up");
  }

  function dockPanelActionText(label) {
    return '<span class="ch-ai-dock__panel-action-label">' + label + "</span>";
  }

  function dockPanelActionIcon(iconId, sizeClass) {
    return (
      '<span class="ch-ai-dock__panel-action-icon" aria-hidden="true">' +
      '<svg class="ch-icon ' +
      (sizeClass || "ch-icon--sm") +
      '" focusable="false"><use href="#' +
      iconId +
      '"/></svg></span>'
    );
  }

  function ensureDockPanelActionMarkup() {
    var $new = $("[data-ch-dock-new-chat]").first();
    if ($new.length) {
      $new.removeClass("btn-icon").addClass("ch-ai-dock__panel-action ch-ai-dock__panel-new--text");
      if ($new.find(".ch-ai-dock__panel-action-icon").length || !$new.find(".ch-ai-dock__panel-action-label").length) {
        $new.html(dockPanelActionText("New chat"));
      }
    }

    var $full = $("[data-ch-dock-fullscreen]").first();
    if ($full.length) {
      $full
        .removeClass("btn-icon ch-ai-dock__panel-full--icon-only")
        .addClass("ch-ai-dock__panel-action ch-ai-dock__panel-full--text");
      if ($full.find(".ch-ai-dock__panel-action-icon").length || !$full.find(".ch-ai-dock__panel-action-label").length) {
        $full.html(dockPanelActionText("Expand"));
      }
    }

    var $collapse = $("[data-ch-ai-dock-collapse]").first();
    if ($collapse.length) {
      $collapse
        .removeClass("btn-icon")
        .addClass("ch-ai-dock__panel-action ch-ai-dock__collapse--icon-only");
      if ($collapse.find(".ch-ai-dock__panel-action-label").length || $collapse.find("use").attr("href") !== "#ch-x") {
        $collapse.html(dockPanelActionIcon("ch-x", "ch-icon--sm"));
      }
    }
  }

  function syncDockFullscreenUi(fullscreen) {
    var $btn = $("[data-ch-dock-fullscreen]");
    if (!$btn.length) return;
    var label = fullscreen ? "Minimize" : "Expand";
    $btn.attr("aria-pressed", fullscreen ? "true" : "false");
    $btn.attr("aria-label", fullscreen ? "Minimize chat panel" : "Expand chat panel");
    $btn.attr("title", fullscreen ? "Return to compact panel" : "Make panel larger");
    $btn.find(".ch-ai-dock__panel-action-label").text(label);
    $btn.toggleClass("ch-ai-dock__panel-full--active", fullscreen);
  }

  function syncDockNewChatUi() {
    var $btn = $("[data-ch-dock-new-chat]");
    if (!$btn.length) return;
    var hasChat = dockHasConversation();
    $btn.toggleClass("ch-ai-dock__panel-new--idle", !hasChat);
    $btn.attr("aria-label", hasChat ? "Start new chat" : "Start new chat (no messages yet)");
    $btn.attr("title", hasChat ? "Clear this conversation and start over" : "No messages to clear yet");
    $btn.find(".ch-ai-dock__panel-action-label").text("New chat");
  }

  function flashDockPanelAction(selector, effect) {
    var $btn = $(selector).first();
    if (!$btn.length) return;
    var className =
      effect === "shake"
        ? "ch-ai-dock__panel-new--shake"
        : effect === "collapse"
          ? "ch-ai-dock__collapse--flash"
          : effect === "fullscreen"
            ? "ch-ai-dock__panel-full--flash"
            : "ch-ai-dock__panel-new--flash";
    $btn.removeClass(
      "ch-ai-dock__panel-new--flash ch-ai-dock__panel-new--shake ch-ai-dock__panel-full--flash ch-ai-dock__collapse--flash"
    );
    void $btn[0].offsetWidth;
    $btn.addClass(className);
    window.setTimeout(function () {
      $btn.removeClass(className);
    }, 420);
  }

  function setDockFullscreen(fullscreen, opts) {
    opts = opts || {};
    var $dock = $("#chAiDock");
    if (!$dock.length) return;
    var $thread = $("#chCopilotThread");
    fullscreen = !!fullscreen;

    $dock.toggleClass("ch-ai-dock--fullscreen", fullscreen);
    $("body").toggleClass("ch-ai-dock-fullscreen-active", fullscreen);

    if (fullscreen) {
      expandAiDock();
      if ($thread.length && !$thread.prop("hidden")) {
        $thread.addClass("ch-ai-dock__thread--expanded");
        syncDockThreadToggleUi(true);
      }
    }

    document.documentElement.style.setProperty(
      "--ch-ai-dock-offset",
      fullscreen ? AI_DOCK_COLLAPSED_OFFSET : getAiDockExpandedOffset()
    );
    syncDockFullscreenUi(fullscreen);
    if (!opts.skipSave) saveAiDockState();
  }

  function dockHasConversation() {
    var $thread = $("#chCopilotThread");
    return $thread.length && !$thread.prop("hidden") && $thread.children().length > 0;
  }

  function syncDockSuggestionsVisibility() {
    var $list = $("#chCopilotSuggestions");
    if (!$list.length) return;
    if (dockHasConversation()) {
      $list.addClass("d-none");
      return;
    }
    if ($list.children().length) {
      $list.removeClass("d-none");
    }
  }

  function resetAiDockChat() {
    var $thread = $("#chCopilotThread");
    if (!$thread.length) return;
    $thread.empty().prop("hidden", true).removeClass("ch-ai-dock__thread--expanded");
    chatSession.history = [];
    chatSession.lastTopic = "";
    $("#chCopilotInput").val("").trigger("input");
    syncAiDockComposerState();
    refreshDockSuggestions(window.__chDockSuggestionOpts || {});
    document.documentElement.style.setProperty("--ch-ai-dock-offset", getAiDockExpandedOffset());
    syncDockNewChatUi();
    saveAiDockState();
  }

  var DOCK_INTENT_UI = {
    ask: { icon: "ch-chat", tone: "ask" },
    domain: { icon: "ch-globe", tone: "domain" },
    bundle: { icon: "ch-grid", tone: "bundle" },
    brief: { icon: "ch-file-earmark", tone: "brief" },
    creative: { icon: "ch-upload", tone: "creative" },
    audience: { icon: "ch-people", tone: "audience" },
  };

  function ensureDockIntentChrome() {
    $("[data-ch-ai-dock-intent]").each(function () {
      var $btn = $(this);
      var key = ($btn.attr("data-ch-ai-dock-intent") || "").trim();
      var meta = DOCK_INTENT_UI[key];
      if (!meta || $btn.data("chIntentChrome")) return;
      $btn.data("chIntentChrome", true);
      var label = $btn.text().trim();
      $btn
        .addClass("ch-ai-dock__intent--" + meta.tone)
        .html(
          '<span class="ch-ai-dock__intent-icon" aria-hidden="true">' +
            '<svg class="ch-icon ch-icon--sm" focusable="false"><use href="#' +
            meta.icon +
            '"/></svg></span>' +
            '<span class="ch-ai-dock__intent-label">' +
            label +
            "</span>"
        );
    });
  }

  function syncDockPanelActionsUi() {
    ensureDockPanelActionMarkup();
    $("[data-ch-ai-dock-collapse]").attr({
      title: "Close chat",
      "aria-label": "Close chat",
    });
    $("[data-ch-dock-fullscreen]").removeClass("ch-ai-dock__composer-full");
    syncDockFullscreenUi($("#chAiDock").hasClass("ch-ai-dock--fullscreen"));
    syncDockNewChatUi();
  }

  function ensureDockPanelChrome() {
    var $panel = $(".ch-ai-dock__panel");
    if (!$panel.length || $panel.data("chPanelChrome")) {
      syncDockPanelActionsUi();
      return;
    }
    $panel.data("chPanelChrome", true);

    var $collapse = $panel.find("[data-ch-ai-dock-collapse]").first();
    var $composerActions = $panel.find(".ch-ai-dock__composer .ch-ai-dock__panel-actions");
    if ($composerActions.length) {
      var $collapseInComposer = $composerActions.find("[data-ch-ai-dock-collapse]").first();
      if ($collapseInComposer.length) $collapse = $collapseInComposer;
      $composerActions.find("[data-ch-dock-fullscreen]").remove();
      if ($collapse.length) $collapse.insertAfter($composerActions);
      $composerActions.remove();
    }

    if ($panel.find(".ch-ai-dock__panel-head").length) {
      syncDockPanelActionsUi();
      return;
    }

    var $head = $(
      '<div class="ch-ai-dock__panel-head">' +
        '<span class="ch-ai-dock__panel-title">' + CH_COPY.assistantName + "</span>" +
        '<div class="ch-ai-dock__panel-actions"></div>' +
        "</div>"
    );
    $panel.prepend($head);
    var $actions = $head.find(".ch-ai-dock__panel-actions");

    $actions.append(
      '<button type="button" class="btn btn-sm ch-ai-dock__panel-action ch-ai-dock__panel-new ch-ai-dock__panel-new--text" data-ch-dock-new-chat aria-label="Start new chat" title="Clear this conversation and start over">' +
        dockPanelActionText("New chat") +
        "</button>" +
        '<button type="button" class="btn btn-sm ch-ai-dock__panel-action ch-ai-dock__panel-full ch-ai-dock__panel-full--text" data-ch-dock-fullscreen aria-pressed="false" aria-label="Expand chat panel" title="Make panel larger">' +
        dockPanelActionText("Expand") +
        "</button>"
    );

    if ($collapse.length) {
      $collapse
        .removeClass("btn-icon")
        .addClass("ch-ai-dock__panel-action ch-ai-dock__collapse ch-ai-dock__collapse--icon-only")
        .attr("aria-label", "Close chat")
        .attr("title", "Close chat")
        .html(dockPanelActionIcon("ch-x", "ch-icon--sm"));
      $actions.append($collapse);
    } else {
      $actions.append(
        '<button type="button" class="btn btn-sm ch-ai-dock__panel-action ch-ai-dock__collapse ch-ai-dock__collapse--icon-only" data-ch-ai-dock-collapse aria-label="Close chat" title="Close chat">' +
          dockPanelActionIcon("ch-x", "ch-icon--sm") +
          "</button>"
      );
    }

    syncDockPanelActionsUi();
  }

  function ensureDockThreadChrome($thread) {
    if (!$thread.length || $thread.data("chChrome")) return;
    $thread.data("chChrome", true);
    if (!$thread.parent().hasClass("ch-ai-dock__thread-stack")) {
      $thread.wrap('<div class="ch-ai-dock__thread-stack"></div>');
    }
    $thread.attr("tabindex", "0");
  }

  function setChatGenerating(busy, $send, $analyze) {
    chatSession.generating = busy;
    if ($send && $send.length) {
      $send.prop("disabled", busy).toggleClass("ch-chat-send--busy", busy);
    }
    if ($analyze && $analyze.length) {
      if (busy) {
        $analyze.prop("disabled", true).addClass("ch-chat-send--busy");
      }
    }
  }

  function dispatchChatExchange($scroll, msg, opts) {
    opts = opts || {};
    var $page = opts.$page || $("#chChatPage");
    var $threadSection = opts.$threadSection || $(".ch-chat-thread-section");
    var $send = opts.$send || $("#chChatSend");
    var $analyze = opts.$analyze || $("#chCopilotAnalyze");
    var isDock = opts.isDock || false;

    if (chatSession.generating) return Promise.resolve();

    setChatGenerating(true, $send, $analyze);
    chatSession.history.push({ role: "user", text: msg });

    if (opts.$input && opts.$input.length) {
      opts.$input.val("").trigger("input");
    }

    appendChatUserBubble($scroll, msg);
    if (!isDock) activateChatThread($page, $threadSection);
    if (isDock) {
      ensureDockThreadChrome($scroll);
      syncDockSuggestionsVisibility();
    }

    var reply = getAssistantReply(msg, { context: opts.context, preferRich: true });
    if (reply.topic) chatSession.lastTopic = reply.topic;

    if (isDock && isWorkflowEntryPage()) {
      var dockNote =
        "\n\n---\n*Q&A only. Not saved to Analyses. Use **Generate Analysis** in the form, or select **Domain** / **Bundle ID** to start an evaluation.*";
      if (reply.markdown) {
        reply.markdown += dockNote;
      } else if (reply.text) {
        reply.text +=
          " Q&A only. Not saved to Analyses. Use Generate Analysis in the form, or select Domain / Bundle ID to start an evaluation.";
      }
    }

    return deliverChatAssistantReply($scroll, reply).then(function () {
      chatSession.history.push({ role: "assistant", text: reply.markdown || reply.text || "" });
      setChatGenerating(false, $send, null);
      if ($analyze && $analyze.length && !isDock) {
        /* send button sync handles full chat */
      } else if ($analyze && $analyze.length) {
        $analyze.removeClass("ch-chat-send--busy");
        syncAiDockComposerState();
      }
      if (isDock) syncDockNewChatUi();
      if (opts.$input && opts.$input.length) {
        opts.$input.trigger("focus");
      }
      scrollChatToEnd($scroll);
    });
  }

  function initChatComposer() {
    var $ta = $("#chat-input");
    if (!$ta.length) return;

    var $send = $("#chChatSend");
    var $count = $("#chChatCharCount");
    var $page = $("#chChatPage");
    var $scroll = $("#chChatScroll");
    var $threadSection = $(".ch-chat-thread-section");
    var hasThreadUi = $page.length && $scroll.length && $threadSection.length;

    function sync() {
      var len = ($ta.val() || "").length;
      if ($count.length) $count.text(String(len));
      if ($send.length) {
        $send.prop("disabled", chatSession.generating || len === 0 || len > 2000);
      }
    }

    $ta.on("input", sync);
    sync();

    function submitChat() {
      if ($send.prop("disabled")) return;
      if (!hasThreadUi) {
        showToast("Open the Assistant page to chat with Cultura AI.", "secondary");
        return;
      }
      var msg = ($ta.val() || "").trim();
      if (!msg || msg.length > 2000) return;
      dispatchChatExchange($scroll, msg, {
        $page: $page,
        $threadSection: $threadSection,
        $send: $send,
        $input: $ta,
      }).then(sync);
    }

    $send.on("click", submitChat);

    $ta.on("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitChat();
      }
    });
  }

  function initStarterPrompts() {
    $(document).on("click", "[data-ch-starter-prompt]", function () {
      var text = $(this).attr("data-ch-starter-prompt") || $(this).text();
      var sel = $(this).attr("data-ch-prompt-target");
      var $ta = sel ? $(sel) : $("#chat-input");
      if (!$ta.length) $ta = $("#home-ai-input");
      if (!$ta.length) return;

      var autoSend = $(this).attr("data-ch-starter-send") === "true" || $("#chChatPage").length > 0;
      $ta.val(text).trigger("input");
      $ta[0].focus();

      if (autoSend && $("#chChatSend").length) {
        setTimeout(function () {
          if (!chatSession.generating) $("#chChatSend").trigger("click");
        }, 150);
      }
    });

    $(document).on("click", "[data-ch-dock-thread-expand]", function () {
      var $thread = $("#chCopilotThread");
      if (!$thread.length) return;
      var expanded = $thread.toggleClass("ch-ai-dock__thread--expanded").hasClass("ch-ai-dock__thread--expanded");
      syncDockThreadToggleUi(expanded);
      if (!$("#chAiDock").hasClass("ch-ai-dock--fullscreen")) {
        document.documentElement.style.setProperty("--ch-ai-dock-offset", expanded ? "22rem" : AI_DOCK_EXPANDED_OFFSET);
      }
      saveAiDockState();
    });

    $(document).on("click", "[data-ch-dock-fullscreen]", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $dock = $("#chAiDock");
      var entering = !$dock.hasClass("ch-ai-dock--fullscreen");
      flashDockPanelAction("[data-ch-dock-fullscreen]", "fullscreen");
      setDockFullscreen(entering);
    });

    $(document).on("click", "[data-ch-dock-new-chat]", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!dockHasConversation()) {
        flashDockPanelAction("[data-ch-dock-new-chat]", "shake");
        return;
      }
      flashDockPanelAction("[data-ch-dock-new-chat]", "flash");
      resetAiDockChat();
    });

    $(document).on("click", ".ch-ai-dock__panel", function (e) {
      e.stopPropagation();
    });

    $(document).on("click", "#chAiDock.ch-ai-dock--fullscreen", function (e) {
      if (e.target === this) setDockFullscreen(false);
    });
  }

  function initGlobalCommandPalette() {
    var $modal = $("#chCommandPalette");
    var $filter = $("#chCommandPaletteFilter");
    if (!$modal.length) return;
    if (!$filter.length) return;

    function openPalette() {
      if (typeof bootstrap === "undefined") return;
      var inst = bootstrap.Modal.getOrCreateInstance($modal[0]);
      inst.show();
      setTimeout(function () {
        if ($filter.length) {
          $filter.val(($("#global-search").val() || "").trim());
          $filter.trigger("input");
          $filter.trigger("focus");
        }
      }, 10);
    }

    $(document).on("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && String(e.key || "").toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
      }
    });

    $(document).on("click", "[data-ch-command-palette-open]", function (e) {
      e.preventDefault();
      openPalette();
    });

    var $globalSearch = $("#global-search");
    if ($globalSearch.length) {
      $globalSearch.on("focus", function () {
        openPalette();
        $(this).blur();
      });
    }

    $(document).on("click", "#chCommandPalette .list-group-item-action", function () {
      var el = document.getElementById("chCommandPalette");
      if (el && typeof bootstrap !== "undefined") {
        var inst = bootstrap.Modal.getInstance(el);
        if (inst) inst.hide();
      }
    });

    $filter.on("input", function () {
      var q = ($(this).val() || "").trim().toLowerCase();
      $modal.find("[data-ch-palette-label]").each(function () {
        var lab = ($(this).attr("data-ch-palette-label") || "").toLowerCase();
        $(this).toggleClass("d-none", q.length > 0 && lab.indexOf(q) === -1);
      });
    });
  }

  function initChatHistoryDrawer() {
    $(document).on("click", "#chHistoryThreadList .ch-history-thread__menu, #chHistoryThreadList .dropdown-item", function (e) {
      e.preventDefault();
      showToast("Conversation saved. History is separate from your Analyses list.", "secondary");
    });

    $(document).on("click", "[data-ch-new-chat]", function () {
      var $ta = $("#chat-input");
      var $page = $("#chChatPage");
      var $scroll = $("#chChatScroll");
      var $threadSection = $(".ch-chat-thread-section");

      chatSession.token += 1;
      chatSession.generating = false;
      chatSession.history = [];
      chatSession.lastTopic = "";

      if ($page.length) {
        $page.removeClass("ch-chat-page--active");
      }
      if ($scroll.length) {
        $scroll.empty();
      }
      if ($threadSection.length) {
        $threadSection.attr("aria-hidden", "true");
      }
      $(".ch-chat-page-empty").attr("aria-hidden", "false");

      if ($ta.length) {
        $ta.val("").trigger("input");
        $ta.trigger("focus");
      }
      $("#chChatSend").removeClass("ch-chat-send--busy");
      showToast("Started a new conversation.", "primary");
    });

    $("#chHistorySearch").on("input", function () {
      var q = ($(this).val() || "").trim().toLowerCase();
      $("#chHistoryThreadList .ch-history-thread").each(function () {
        var t = ($(this).attr("data-ch-thread-title") || "").toLowerCase();
        $(this).toggleClass("d-none", q.length > 0 && t.indexOf(q) === -1);
      });
      $("#chHistoryThreadList [data-ch-history-group]").each(function () {
        var visible = $(this).find(".ch-history-thread:not(.d-none)").length;
        $(this).toggleClass("d-none", visible === 0);
      });
    });
  }

  function initPromptBrowser() {
    $(document).on("click", "[data-ch-prompt-browser]", function (e) {
      e.preventDefault();
      var el = document.getElementById("chPromptPickerModal");
      if (el && typeof bootstrap !== "undefined") {
        bootstrap.Modal.getOrCreateInstance(el).show();
      }
    });

    $(document).on("click", "[data-ch-prompt-insert]", function () {
      var text = $(this).attr("data-ch-prompt-insert") || "";
      var $ta = $("#chat-input");
      if (!$ta.length) $ta = $("#home-ai-input");
      if ($ta.length) {
        $ta.val(text).trigger("input");
        $ta[0].focus();
      }
      var el = document.getElementById("chPromptPickerModal");
      if (el && typeof bootstrap !== "undefined") {
        var pickerInst = bootstrap.Modal.getInstance(el);
        if (pickerInst) pickerInst.hide();
      }
    });
  }

  function syncLocaleMenuVisibility() {
    var $li = $("[data-ch-locale-menu-item]");
    var $sel = $("#chLocaleSelect");
    if (!$li.length || !$sel.length) return;
    var n = $sel.find("option").length;
    $li.toggleClass("d-none", n <= 1);
  }

  function initLocaleSelect() {
    var $sel = $("#chLocaleSelect");
    if (!$sel.length) return;

    try {
      var saved = localStorage.getItem(STORAGE_LOCALE);
      if (saved) $sel.val(saved);
    } catch (e) {
      /* ignore */
    }

    $sel.on("change", function () {
      try {
        localStorage.setItem(STORAGE_LOCALE, $sel.val() || "en");
      } catch (e) {
        /* ignore */
      }
      showToast("Language preference saved.", "success");
    });
  }

  function initAccountMenu() {
    $(document).on("click", "[data-ch-notifications-open]", function (e) {
      e.preventDefault();
      showToast("No new notifications.", "secondary");
    });
  }

  function initHelpModal() {
    $(document).on("click", "[data-ch-help-open]", function (e) {
      e.preventDefault();
      var el = document.getElementById("chHelpModal");
      if (el && typeof bootstrap !== "undefined") {
        bootstrap.Modal.getOrCreateInstance(el).show();
      }
    });
  }

  function initUpgradeModal() {
    var planHref = getPagePrefix() + "settings.html#plan";
    $("[data-ch-plan-details]").attr("href", planHref);

    $(document).on("click", "[data-ch-upgrade-open]", function (e) {
      var $modal = $("#chUpgradeModal");
      if (!$modal.length || typeof bootstrap === "undefined") return;
      e.preventDefault();
      bootstrap.Modal.getOrCreateInstance($modal[0]).show();
    });
  }

  function initDevNav() {
    if (/\bdev=1\b/.test(window.location.search || "")) {
      $(".ch-dev-only-nav").removeClass("d-none");
    }
  }

  function initNavDestinations() {
    var folder = $("body").attr("data-ch-folder") || "root";
    var map;
    if (folder === "analyses") {
      map = {
        blueprint: "espn-detail.html#tab-blueprint",
      };
    } else if (folder === "nested") {
      map = {
        blueprint: "../analyses/espn-detail.html#tab-blueprint",
      };
    } else {
      map = {
        blueprint: "analyses/espn-detail.html#tab-blueprint",
      };
    }
    Object.keys(map).forEach(function (key) {
      $('a[data-ch-nav="' + key + '"]').each(function () {
        var $link = $(this);
        if (($link.attr("href") || "#") === "#") {
          $link.attr("href", map[key]);
        }
      });
    });
  }

  function activateTabFromHash() {
    var hash = (window.location.hash || "").trim();
    if (!hash || hash.indexOf("#tab-") !== 0) return;
    var tabBtn =
      document.querySelector('#analyses-detail .nav-tabs [data-bs-target="' + hash + '"]') ||
      document.querySelector('[data-bs-target="' + hash + '"]');
    if (!tabBtn || typeof bootstrap === "undefined") return;
    bootstrap.Tab.getOrCreateInstance(tabBtn).show();
    var workspace = document.querySelector(".ch-analysis-workspace");
    if (workspace) workspace.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  var PROCESSED_CSV_ROWS = [
    {
      file: "wellness-signals-q2.csv",
      uploaded: "2026-05-10 09:12",
      processed: "2026-05-10 09:18",
      status: "Ready",
    },
    {
      file: "multicultural-streaming-weights.csv",
      uploaded: "2026-05-12 14:40",
      processed: "-",
      status: "Processing",
      note: "Mapping cultural segments. ~2–4 min.",
    },
    {
      file: "sustainable-home-panel.csv",
      uploaded: "2026-05-11 11:05",
      processed: "2026-05-11 11:06",
      status: "Failed",
      note: "Missing required column audience_id.",
      actionHref: "upload-csv.html#upload-zone",
      actionLabel: "Re-upload",
    },
    {
      file: "urban-design-geo-baseline.csv",
      uploaded: "2026-05-08 08:00",
      processed: "2026-05-08 08:02",
      status: "Ready",
    },
  ];

  var CSV_STATUS_ORDER = { Failed: 0, Processing: 1, Ready: 2 };

  function csvStatusPillClass(status) {
    if (status === "Ready") return "ch-pill ch-pill-success";
    if (status === "Failed") return "ch-pill ch-pill-danger";
    return "ch-pill ch-pill-warning";
  }

  function csvRowMeta(r) {
    if (r.note) {
      var note = escapeHtml(r.note);
      if (r.actionHref && r.actionLabel) {
        return (
          note +
          ' <a href="' +
          escapeAttr(r.actionHref) +
          '" class="text-decoration-none">' +
          escapeHtml(r.actionLabel) +
          "</a>"
        );
      }
      return note;
    }
    return "Uploaded " + escapeHtml(r.uploaded);
  }

  function initLibraryFileList() {
    var $list = $("#chLibraryFileList");
    if (!$list.length) return;

    var rows = isNewAccountMode() ? [] : PROCESSED_CSV_ROWS.slice();
    rows.sort(function (a, b) {
      var statusDiff = (CSV_STATUS_ORDER[a.status] || 9) - (CSV_STATUS_ORDER[b.status] || 9);
      if (statusDiff !== 0) return statusDiff;
      return a.uploaded < b.uploaded ? 1 : a.uploaded > b.uploaded ? -1 : 0;
    });

    $list.empty();
    rows.forEach(function (r) {
      $list.append(
        '<li class="list-group-item d-flex align-items-start justify-content-between gap-3">' +
          '<div class="min-w-0">' +
          '<div class="fw-semibold text-truncate">' +
          escapeHtml(r.file) +
          "</div>" +
          '<div class="small text-ch-secondary">' +
          csvRowMeta(r) +
          "</div>" +
          "</div>" +
          '<span class="' +
          csvStatusPillClass(r.status) +
          ' flex-shrink-0">' +
          escapeHtml(r.status) +
          "</span>" +
          "</li>"
      );
    });
  }

  function initProcessedCsvPage() {
    var $tb = $("#chCsvTableBody");
    if (!$tb.length) return;

    var rows = isNewAccountMode() ? [] : PROCESSED_CSV_ROWS.slice();
    var sortKey = "file";
    var sortDir = 1;

    function rowMatches(r, q) {
      if (!q) return true;
      return r.file.toLowerCase().indexOf(q) !== -1;
    }

    function render() {
      var q = ($("#chCsvFilter").val() || "").trim().toLowerCase();
      var list = rows.filter(function (r) {
        return rowMatches(r, q);
      });

      list.sort(function (a, b) {
        var av = a[sortKey];
        var bv = b[sortKey];
        if (av < bv) return -1 * sortDir;
        if (av > bv) return 1 * sortDir;
        return 0;
      });

      var $empty = $("#chCsvEmpty");
      $tb.empty();

      if (!list.length) {
        $empty.removeClass("d-none");
        return;
      }
      $empty.addClass("d-none");

      list.forEach(function (r) {
        var aria = "Actions for " + String(r.file).replace(/"/g, "&quot;");
        $tb.append(
          "<tr>" +
            '<td class="fw-semibold">' +
            escapeHtml(r.file) +
            "</td>" +
            '<td class="text-ch-secondary">' +
            escapeHtml(r.uploaded) +
            "</td>" +
            '<td class="text-ch-secondary">' +
            escapeHtml(r.processed) +
            "</td>" +
            '<td><span class="' +
            csvStatusPillClass(r.status) +
            '">' +
            escapeHtml(r.status) +
            "</span></td>" +
            '<td class="text-end">' +
            '<div class="dropdown">' +
            '<button type="button" class="btn btn-sm btn-light border" data-bs-toggle="dropdown" aria-expanded="false" aria-label="' +
            aria +
            '">' +
            '<svg class="ch-icon" aria-hidden="true" focusable="false"><use href="#ch-dots-vertical"/></svg>' +
            "</button>" +
            '<ul class="dropdown-menu dropdown-menu-end">' +
            '<li><a class="dropdown-item" href="#">Download</a></li>' +
            '<li><a class="dropdown-item" href="#">View</a></li>' +
            "</ul>" +
            "</div>" +
            "</td>" +
            "</tr>"
        );
      });
    }

    $("#chCsvFilter").on("input", render);

    $("#chCsvSort").on("change", function () {
      var v = $(this).val() || "file-asc";
      var map = {
        "file-desc": ["file", -1],
        "file-asc": ["file", 1],
        "uploaded-desc": ["uploaded", -1],
        "uploaded-asc": ["uploaded", 1],
        "processed-desc": ["processed", -1],
        "processed-asc": ["processed", 1],
        "status-asc": ["status", 1],
        "status-desc": ["status", -1],
      };
      var next = map[v] || ["file", 1];
      sortKey = next[0];
      sortDir = next[1];
      render();
    });

    render();
  }

  var DOCK_GENERIC_SUGGESTIONS = [
    "Explain how CRS scoring works",
    "What should I analyze next?",
    "Help me defend a CRS score to a buyer",
  ];

  var AI_DOCK_INTENTS = {
    domain: {
      placeholder: "Enter domain (www.domain.com) for CRS evaluation",
      cta: "Analyze",
      ctaMode: "workflow",
      triggerText: "Enter a domain for CRS evaluation…",
      showAttachments: false,
    },
    bundle: {
      placeholder: "Enter app or Bundle ID for CRS evaluation",
      cta: "Analyze",
      ctaMode: "workflow",
      triggerText: "Enter Bundle ID for CRS evaluation…",
      showAttachments: false,
    },
    brief: {
      placeholder: "Describe your campaign or attach a brief below",
      cta: "Analyze",
      ctaMode: "workflow",
      triggerText: "Upload a campaign brief for cultural signals…",
      showAttachments: true,
      attachKind: "brief",
    },
    creative: {
      placeholder: "Describe the creative or attach an asset below",
      cta: "Analyze",
      ctaMode: "workflow",
      triggerText: "Review creative for cultural fit…",
      showAttachments: true,
      attachKind: "creative",
    },
    audience: {
      placeholder: "Describe your audience segment hypothesis",
      cta: "Start",
      ctaMode: "navigate",
      triggerText: "Start from an audience segment…",
      showAttachments: false,
    },
    ask: {
      placeholder: "Ask about CRS scores, cultural fit, or recommendations…",
      cta: "Ask",
      ctaMode: "chat",
      triggerText: "Ask about CRS scores, site fit, or recommendations…",
      showAttachments: false,
    },
  };

  var aiDockIntent = "ask";

  var COPILOT_PAGE_SUGGESTIONS = {
    home: DOCK_GENERIC_SUGGESTIONS,
    analyses: [
      "Compare two analyses in my workspace",
      "Filter activation-ready analyses",
      "What makes a strong CRS score?",
    ],
    "analyses-new": DOCK_GENERIC_SUGGESTIONS,
    audiences: [
      "How does Diego Ramirez affect CRS?",
      "What stereotypes should we avoid?",
      "Use this segment in a new analysis",
    ],
    activations: [
      "Which analyses are ready to activate?",
      "What does Ready for DSP setup mean?",
      "Walk me through creating a deal ID",
    ],
    library: [
      "Where do I upload audience CSVs?",
      "Why did my file fail validation?",
      "How do I use processed files in an analysis?",
    ],
    settings: [
      "What's included in the Free Plan?",
      "How do I connect my DSP?",
      "Where are notification settings?",
    ],
  };

  var ANALYSIS_COPILOT_SUGGESTIONS = {
    "#tab-overview": [
      "Explain why this scored 82",
      "What would improve the score?",
      "Summarize for a client",
      "What are the top risks?",
    ],
    "#tab-audience": [
      "Turn this persona into targeting criteria",
      "What creative tone would resonate?",
      "What stereotypes should we avoid?",
    ],
    "#tab-inventory": [
      "Why was this domain included?",
      "Find more Spanish-language sports inventory",
      "Exclude general-market domains",
    ],
    "#tab-blueprint": [
      "Summarize this blueprint in 3 bullets",
      "What cultural tensions should we be aware of?",
    ],
    "#tab-campaign-plan": [
      "Recommend a lower-budget version",
      "Adjust this for awareness",
      "Rewrite this for a media buyer",
    ],
    "#tab-activation": [
      "What DSPs work best for this audience?",
      "Estimate reach for $5k/week",
    ],
  };

  var EVIDENCE_CONTENT = {
    "audience-alignment": {
      title: "Audience Alignment",
      score: "+32 pts · 32/40 category · 80% performance · 40% weight",
      body:
        "Latino millennial sports fans over-index on ESPN digital properties for highlight consumption, live scores, and fantasy participation. Bilingual content paths and athlete storytelling drive repeat visits.",
      askPrompt: "Explain the audience alignment score for ESPN.com",
    },
    "ownership-authenticity": {
      title: "Ownership & Authenticity",
      score: "+20 pts · 20/25 category · 80% performance · 15% weight",
      body:
        "ESPN maintains credible sports authority with growing Spanish-language verticals (espndeportes.com) and community-driven commentary features that signal authentic engagement.",
      askPrompt: "How does ESPN demonstrate ownership and authenticity?",
    },
    "editorial-ux": {
      title: "Editorial/UX Signals",
      score: "+18 pts · 18/25 category · 72% performance · 30% weight",
      body:
        "Mobile-first layout, personalized team feeds, and highlight clips align with daily sports rituals. UX patterns support quick score checks and shareable moments.",
      askPrompt: "What editorial and UX signals support the CRS score?",
    },
    "intersectional-representation": {
      title: "Intersectional Representation",
      score: "+12 pts · 12/15 category · 80% performance · 15% weight",
      body:
        "Coverage spans soccer, baseball, and basketball with Latino athlete spotlights and bilingual commentary. Representation extends beyond tokenism into sustained narrative coverage.",
      askPrompt: "How well does ESPN represent intersectional sports audiences?",
    },
  };

  function renderCopilotSuggestions(prompts) {
    var $list = $("#chCopilotSuggestions");
    if (!$list.length) return;
    $list.empty();
    if (!prompts.length) {
      $list.addClass("d-none");
      return;
    }
    prompts.forEach(function (p) {
      $list.append(
        '<button type="button" class="ch-suggested-prompt" data-ch-copilot-prompt="' +
          p.replace(/"/g, "&quot;") +
          '">' +
          p +
          "</button>"
      );
    });
    syncDockSuggestionsVisibility();
  }

  function normalizeDockDomain(raw) {
    var d = (raw || "").trim();
    if (!d) return "";
    d = d.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    return d.split("/")[0].split("?")[0];
  }

  function getDockTargetFromPage() {
    if (!$("#analyses-detail").length) return "";
    var $meta = $(".ch-analysis-meta span").filter(function () {
      return /\.[a-z]{2,}/i.test(($(this).text() || "").trim());
    });
    return normalizeDockDomain($meta.first().text());
  }

  function getDockTargetFromInput() {
    var raw = ($("#chCopilotInput").val() || "").trim();
    if (!raw || !looksLikeDomain(raw)) return "";
    return normalizeDockDomain(raw);
  }

  function getDomainDockSuggestions(domain) {
    return [
      "Give me CRS for " + domain,
      "Curate site list for " + domain,
      "Create Persona for " + domain,
    ];
  }

  function isWorkflowEntryPage() {
    var page = getCurrentPage();
    return page === "home" || page === "analyses-new";
  }

  function getDefaultAiDockIntent() {
    return getCurrentPage() === "analyses-new" ? "domain" : "ask";
  }

  function getAiDockIntent() {
    if (!isWorkflowEntryPage()) return "ask";
    return aiDockIntent;
  }

  function getAiDockIntentConfig(intent) {
    return AI_DOCK_INTENTS[intent] || AI_DOCK_INTENTS.ask;
  }

  function getActiveAnalysisTab() {
    var $active = $("[data-bs-toggle=\"tab\"].active");
    return ($active.attr("data-bs-target") || "").trim();
  }

  function getDockSuggestions(options) {
    options = options || {};
    if (options.tabSuggestions && options.activeTab) {
      var tabPrompts = options.tabSuggestions[options.activeTab];
      if (tabPrompts && tabPrompts.length) return tabPrompts;
    }
    var target = getDockTargetFromPage() || getDockTargetFromInput();
    if (target) {
      return getDomainDockSuggestions(target);
    }
    var page = getCurrentPage();
    if (isWorkflowEntryPage()) {
      return DOCK_GENERIC_SUGGESTIONS;
    }
    return options.suggestions || COPILOT_PAGE_SUGGESTIONS[page] || DOCK_GENERIC_SUGGESTIONS;
  }

  function refreshDockSuggestions(options) {
    renderCopilotSuggestions(getDockSuggestions(options || window.__chDockSuggestionOpts || {}));
  }

  var aiDockAttachedFile = null;

  function clearAiDockFile() {
    aiDockAttachedFile = null;
    $("#chAiDockBrief, #chAiDockCreative").val("");
    $("[data-ch-ai-dock-file-label]").addClass("d-none").text("");
    $("[data-ch-ai-dock-file-clear]").addClass("d-none");
  }

  function syncAiDockComposerState() {
    var $input = $("#chCopilotInput");
    var $cta = $("#chCopilotAnalyze");
    if (!$input.length || !$cta.length) return;
    var text = ($input.val() || "").trim();
    var len = text.length;
    var intent = getAiDockIntent();
    var cfg = getAiDockIntentConfig(intent);
    var enabled = false;

    if (cfg.ctaMode === "chat") {
      enabled = len > 0 && len <= 2000;
    } else if (aiDockAttachedFile) {
      enabled = true;
    } else if (intent === "domain" && looksLikeDomain(text)) {
      enabled = true;
    } else if (intent === "bundle" && len > 0 && text.indexOf(" ") === -1) {
      enabled = true;
    } else if ((intent === "brief" || intent === "creative" || intent === "audience") && len > 0 && len <= 2000) {
      enabled = true;
    }

    $cta.text(cfg.cta);
    $cta.prop("disabled", !enabled);
  }

  function initAiDockFileInputs() {
    $(document).on("click", "[data-ch-ai-dock-brief-trigger]", function (e) {
      e.preventDefault();
      $("#chAiDockBrief").trigger("click");
    });

    $(document).on("click", "[data-ch-ai-dock-creative-trigger]", function (e) {
      e.preventDefault();
      $("#chAiDockCreative").trigger("click");
    });

    $(document).on("change", "#chAiDockBrief, #chAiDockCreative", function () {
      var file = this.files && this.files[0];
      if (!file) return;
      var kind = this.id === "chAiDockBrief" ? "brief" : "creative";
      if (isWorkflowEntryPage()) {
        setAiDockIntent(kind, { keepFile: true });
      }
      aiDockAttachedFile = { file: file, kind: kind, name: file.name };
      $("[data-ch-ai-dock-file-label]").text(file.name).removeClass("d-none");
      $("[data-ch-ai-dock-file-clear]").removeClass("d-none");
      syncAiDockComposerState();
      showToast((kind === "brief" ? "Brief" : "Creative") + " ready: " + file.name, "secondary");
    });

    $(document).on("click", "[data-ch-ai-dock-file-clear]", function (e) {
      e.preventDefault();
      clearAiDockFile();
      syncAiDockComposerState();
    });
  }

  var aiDockSuggestTimer = null;

  function scheduleDockSuggestionRefresh() {
    if (aiDockSuggestTimer) clearTimeout(aiDockSuggestTimer);
    aiDockSuggestTimer = setTimeout(function () {
      refreshDockSuggestions(window.__chDockSuggestionOpts || {});
    }, 250);
  }

  function looksLikeDomain(text) {
    var t = (text || "").trim().toLowerCase();
    if (!t) return false;
    if (t.indexOf(" ") !== -1) return false;
    return t.indexOf(".") !== -1 || t.indexOf("www") === 0;
  }

  function setAiDockIntent(intent, opts) {
    opts = opts || {};
    var prev = aiDockIntent;
    if (isWorkflowEntryPage()) {
      aiDockIntent = intent || getDefaultAiDockIntent();
    } else {
      aiDockIntent = "ask";
    }
    if (!opts.keepInput && prev !== aiDockIntent && !opts.prompt) {
      $("#chCopilotInput").val("");
      if (!opts.keepFile) {
        clearAiDockFile();
      }
    }
    syncAiDockIntentUi();
    if (!opts.skipSuggestions) {
      refreshDockSuggestions(window.__chDockSuggestionOpts || {});
    }
    syncAiDockComposerState();
  }

  function syncAiDockIntentUi() {
    var intent = getAiDockIntent();
    var cfg = getAiDockIntentConfig(intent);

    $("[data-ch-ai-dock-intent]").each(function () {
      var key = ($(this).attr("data-ch-ai-dock-intent") || "").trim();
      var active = key === intent;
      $(this)
        .toggleClass("ch-ai-dock__intent--active", active)
        .attr("aria-pressed", active ? "true" : "false");
    });

    $("#chCopilotInput").attr("placeholder", cfg.placeholder);
    $("[data-ch-ai-dock-trigger-text]").text(cfg.triggerText);

    var $attachments = $("[data-ch-ai-dock-attachments]");
    if ($attachments.length) {
      $attachments.prop("hidden", !cfg.showAttachments);
    }

    $("[data-ch-ai-dock-brief-trigger], [data-ch-ai-dock-creative-trigger]").removeClass("ch-ai-dock__attach--active");
    if (cfg.attachKind === "brief") {
      $("[data-ch-ai-dock-brief-trigger]").addClass("ch-ai-dock__attach--active");
    } else if (cfg.attachKind === "creative") {
      $("[data-ch-ai-dock-creative-trigger]").addClass("ch-ai-dock__attach--active");
    }
  }

  function showAiDockIntentRow() {
    var $row = $("[data-ch-ai-dock-intent-row]");
    if (!$row.length) return;
    $row.prop("hidden", !isWorkflowEntryPage());
  }

  function copilotReplyForMessage(text, context) {
    var t = (text || "").toLowerCase();
    context = context || "";
    var prefix = getPagePrefix();
    if ($("#analyses-detail").length) {
      var analysisTitle = ($("#analyses-detail h1").first().text() || "This analysis").trim();
      var analysisScore = ($("#analyses-detail .ch-crs-score__number").first().text() || "").trim();
      if (t.indexOf("improve") !== -1 || t.indexOf("score") !== -1) {
        return (
          analysisTitle +
          " scores CRS " +
          (analysisScore || "—") +
          " from dimension contributions. Open the Overview tab for the score breakdown, then adjust inventory or creative based on flagged dimensions."
        );
      }
      if (t.indexOf("inventory") !== -1 || t.indexOf("domain") !== -1) {
        return "Open the Inventory tab to review curated domains or placements, then continue to Campaign Plan when your mix is ready.";
      }
      if (t.indexOf("persona") !== -1 || t.indexOf("audience") !== -1) {
        return "Open the Audience tab to review targeting filters and persona fit, then save to My segments if you want to reuse this lens.";
      }
      return (
        analysisTitle +
        " (CRS " +
        (analysisScore || "—") +
        "). Next: review evidence in Overview, refine inventory if needed, or jump to Activation when your plan is ready."
      );
    }
    if (context.indexOf("Home") !== -1 || getCurrentPage() === "home") {
      if (t.indexOf("resume") !== -1) {
        return "Your most recent analysis is ESPN.com Evaluation (CRS 82, completed Jun 4). Open it from Recent Analyses to continue toward activation.";
      }
      return "Start with New Analysis to evaluate a domain, brief, or creative. Quick Start cards on Home map to common workflows. Each path creates a saved evaluation.";
    }
    if (context.indexOf("Analyses") !== -1 && getCurrentPage() === "analyses") {
      return "Four analyses are in your workspace. ESPN.com Evaluation (CRS 82) is activation-ready; Nike, Tubi, and Breakfast Club show different CRS tiers and certification states. Use filters to narrow by status, then open any row to review evidence and next steps.";
    }
    if (getCurrentPage() === "analyses-new") {
      return (
        "Choose an input type that matches your starting point: domain for publisher evaluation, brief for campaign planning, or audience for segment-first analysis. " +
        "When ready, click Generate Analysis in Step 2 to create a saved evaluation with CRS verdict and evidence."
      );
    }
    if (getCurrentPage() === "audiences") {
      return "Audience segments inform CRS scoring and inventory curation. Pick a segment and click Start analysis, or save your own under My segments for reuse in New Analysis.";
    }
    if (getCurrentPage() === "activations") {
      return "ESPN.com Evaluation is ready for DSP setup (CRS 82). Click Continue setup to enter deal details, or open analyses still in progress to finish inventory first.";
    }
    if (getCurrentPage() === "library") {
      return "Review audience signal files and their status. Use Upload CSV to add files, then start a New Analysis to apply them.";
    }
    if (getCurrentPage() === "settings") {
      return "Manage plan, workspace language, and DSP integrations here. Connect your DSP to activate analyses directly from the Activation tab.";
    }
    return (
      "I can help explain CRS scores, summarize analyses for clients, or guide you through persona, inventory, and activation steps. " +
      "Try starting a New Analysis when you are ready to score a domain, brief, or creative."
    );
  }

  function getPagePrefix() {
    var folder = ($("body").attr("data-ch-folder") || "").trim();
    if (folder === "analyses") return "../";
    var path = window.location.pathname || "";
    if (path.indexOf("/processed-csvs/") !== -1 || path.indexOf("/chat/") !== -1) return "../";
    return "";
  }

  function ensureAiDockFab($dock) {
    if (!$dock.length || $dock.find(".ch-ai-dock__fab").length) return;
    $dock.append(
      '<button type="button" class="ch-ai-dock__fab" data-ch-ai-dock-expand aria-label="Ask Cultura AI">' +
        '<svg class="ch-icon" aria-hidden="true" focusable="false"><use href="#ch-chat"/></svg>' +
        "</button>"
    );
  }

  function getAiDockExpandedOffset() {
    var $dock = $("#chAiDock");
    if ($dock.hasClass("ch-ai-dock--fullscreen")) return AI_DOCK_COLLAPSED_OFFSET;
    var $thread = $("#chCopilotThread");
    if ($thread.length && !$thread.prop("hidden")) {
      return $thread.hasClass("ch-ai-dock__thread--expanded") ? "22rem" : AI_DOCK_EXPANDED_OFFSET;
    }
    return AI_DOCK_EXPANDED_OFFSET;
  }

  function saveAiDockState() {
    var $dock = $("#chAiDock");
    if (!$dock.length) return;
    var $thread = $("#chCopilotThread");
    try {
      sessionStorage.setItem(
        STORAGE_AI_DOCK,
        JSON.stringify({
          expanded: $dock.hasClass("ch-ai-dock--expanded"),
          intent: aiDockIntent,
          inputValue: ($("#chCopilotInput").val() || "").trim(),
          threadVisible: $thread.length && !$thread.prop("hidden"),
          threadExpanded: $thread.hasClass("ch-ai-dock__thread--expanded"),
          threadHtml: $thread.length ? $thread.html() : "",
          fullscreen: $dock.hasClass("ch-ai-dock--fullscreen"),
        })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function restoreAiDockState() {
    var $dock = $("#chAiDock");
    if (!$dock.length) return;
    try {
      var raw = sessionStorage.getItem(STORAGE_AI_DOCK);
      if (!raw) return;
      var state = JSON.parse(raw);
      if (isWorkflowEntryPage() && state.intent) {
        aiDockIntent = state.intent;
      }
      if (state.inputValue) {
        $("#chCopilotInput").val(state.inputValue);
      }
      if (state.threadHtml) {
        var $thread = $("#chCopilotThread");
        $thread.html(state.threadHtml);
        $thread
          .find(".ch-chat-markdown--collapsed, .ch-chat-markdown--expanded")
          .removeClass("ch-chat-markdown--collapsed ch-chat-markdown--expanded");
        $thread.find(".ch-chat-expand-btn").remove();
        if (state.threadVisible) {
          $thread.prop("hidden", false);
          ensureDockThreadChrome($thread);
        }
      }
      ensureDockPanelChrome();
      ensureDockIntentChrome();
      syncDockSuggestionsVisibility();
      if (state.fullscreen) {
        setDockFullscreen(true, { skipSave: true });
      } else if (state.expanded) {
        document.documentElement.style.setProperty("--ch-ai-dock-offset", getAiDockExpandedOffset());
      }
    } catch (e) {
      /* ignore */
    }
  }

  function bindAiDockPersistence() {
    $(window).on("pagehide", saveAiDockState);
    $(document).on("click", ".ch-nav-link[href], .ch-sidebar a[href]", function () {
      var href = ($(this).attr("href") || "").trim();
      if (!href || href === "#" || href.indexOf("javascript:") === 0) return;
      saveAiDockState();
      $("body").addClass("ch-ai-dock-nav-leave");
    });
  }

  function playAiDockNavEnter() {
    $("body").addClass("ch-ai-dock-nav-enter");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        $("body").removeClass("ch-ai-dock-nav-enter");
      });
    });
  }

  function expandAiDock(opts) {
    opts = opts || {};
    var $dock = $("#chAiDock");
    if (!$dock.length) return;
    $dock.removeClass("ch-ai-dock--collapsed").addClass("ch-ai-dock--expanded");
    $dock.attr("aria-expanded", "true");
    $("body").addClass("ch-ai-dock-expanded");
    document.documentElement.style.setProperty("--ch-ai-dock-offset", getAiDockExpandedOffset());
    if (opts.prompt) {
      $("#chCopilotInput").val(opts.prompt).trigger("input");
    }
    saveAiDockState();
    setTimeout(function () {
      var ta = document.getElementById("chCopilotInput");
      if (ta) ta.focus();
    }, 50);
  }

  function collapseAiDock() {
    var $dock = $("#chAiDock");
    if (!$dock.length) return;
    if ($dock.hasClass("ch-ai-dock--fullscreen")) {
      setDockFullscreen(false, { skipSave: true });
    }
    $dock.removeClass("ch-ai-dock--expanded").addClass("ch-ai-dock--collapsed");
    $dock.attr("aria-expanded", "false");
    $("body").removeClass("ch-ai-dock-expanded");
    document.documentElement.style.setProperty("--ch-ai-dock-offset", AI_DOCK_COLLAPSED_OFFSET);
    saveAiDockState();
  }

  function submitAiDockChat(text) {
    var $thread = $("#chCopilotThread");
    var ctx = $("body").attr("data-ch-copilot-context") || "";
    expandAiDock();
    $thread.prop("hidden", false);
    dispatchChatExchange($thread, text, {
      isDock: true,
      context: ctx,
      $analyze: $("#chCopilotAnalyze"),
      $input: $("#chCopilotInput"),
    }).then(function () {
      clearAiDockFile();
      syncAiDockComposerState();
      saveAiDockState();
    });
  }

  var ANALYSIS_RUN_DURATION_MS = 5000;
  var ANALYSIS_RUN_DURATION_REDUCED_MS = 800;
  var analysisRunActive = false;
  var analysisRunToken = 0;

  function getAnalysisRunStages(intent) {
    if (intent === "bundle") {
      return [
        "Resolving Bundle ID…",
        "Scanning app inventory signals…",
        "Scoring audience alignment…",
        "Building CRS breakdown…",
      ];
    }
    if (intent === "brief") {
      return [
        "Parsing campaign brief…",
        "Extracting audience signals…",
        "Scoring cultural relevance…",
        "Building analysis…",
      ];
    }
    if (intent === "creative") {
      return [
        "Reviewing creative asset…",
        "Evaluating tone and representation…",
        "Scoring cultural fit…",
        "Building analysis…",
      ];
    }
    if (intent === "audience") {
      return [
        "Processing audience hypothesis…",
        "Mapping segment signals…",
        "Scoring cultural relevance…",
        "Building analysis…",
      ];
    }
    return [
      "Resolving domain…",
      "Scanning editorial & UX signals…",
      "Scoring audience alignment…",
      "Building CRS breakdown…",
    ];
  }

  function buildAnalysisRunMarkup(title, target, stages) {
    var stagesHtml = stages
      .map(function (label, i) {
        return (
          '<li class="ch-analysis-run__stage' +
          (i === 0 ? " ch-analysis-run__stage--active" : "") +
          '" data-ch-analysis-stage="' +
          i +
          '">' +
          '<span class="ch-analysis-run__stage-icon" aria-hidden="true"></span>' +
          '<span class="ch-analysis-run__stage-label">' +
          escapeChatHtml(label) +
          "</span>" +
          "</li>"
        );
      })
      .join("");

    return (
      '<div class="ch-analysis-run__inner">' +
      '<div class="ch-analysis-run__head mb-3">' +
      '<div class="fw-semibold" id="chAnalysisRunTitle">' +
      escapeChatHtml(title) +
      "</div>" +
      (target
        ? '<div class="small text-ch-secondary mt-1">' + escapeChatHtml(target) + "</div>"
        : "") +
      "</div>" +
      '<ol class="ch-analysis-run__stages list-unstyled mb-3" aria-live="polite">' +
      stagesHtml +
      "</ol>" +
      '<div class="ch-analysis-run__progress progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-labelledby="chAnalysisRunTitle">' +
      '<div class="ch-analysis-run__progress-fill progress-bar" style="width:0%"></div>' +
      "</div>" +
      "</div>"
    );
  }

  function lockAnalysisRunUi(locked) {
    $("body").attr("aria-busy", locked ? "true" : "false");
    $("body").toggleClass("ch-analysis-run-active", !!locked);
    $("#chAiDock").toggleClass("ch-ai-dock--analysis-run", !!locked);
    $("#chCopilotInput, #chCopilotAnalyze, [data-ch-ai-dock-intent], [data-ch-generate-analysis]").each(function () {
      var $el = $(this);
      if (locked) {
        $el.prop("disabled", true).attr("aria-disabled", "true");
        if ($el.is("a")) $el.addClass("disabled");
      } else {
        $el.prop("disabled", false).removeAttr("aria-disabled");
        if ($el.is("a")) $el.removeClass("disabled");
      }
    });
    if (locked) {
      setChatGenerating(true, null, $("#chCopilotAnalyze"));
    }
  }

  function animateAnalysisRun($container, stages, durationMs, onDone) {
    var token = ++analysisRunToken;
    var $stages = $container.find(".ch-analysis-run__stage");
    var $fill = $container.find(".ch-analysis-run__progress-fill");
    var $bar = $container.find(".ch-analysis-run__progress");
    var reduced = prefersReducedChatMotion();
    var duration = reduced ? ANALYSIS_RUN_DURATION_REDUCED_MS : durationMs;
    var stageCount = stages.length;
    var stageDuration = Math.max(280, Math.floor(duration / stageCount));
    var step = 0;

    function setProgress(pct) {
      $bar.attr("aria-valuenow", Math.round(pct));
    }

    requestAnimationFrame(function () {
      if (token !== analysisRunToken) return;
      $fill.css("transition", reduced ? "width 0.2s linear" : "width " + duration + "ms linear");
      $fill.css("width", "100%");
    });

    function finish() {
      if (token !== analysisRunToken) return;
      $stages.removeClass("ch-analysis-run__stage--active").addClass("ch-analysis-run__stage--complete");
      setProgress(100);
      if (onDone) onDone();
    }

    function advance() {
      if (token !== analysisRunToken) return;
      if (step >= stageCount) {
        finish();
        return;
      }
      $stages.each(function (i) {
        var $stage = $(this);
        $stage.toggleClass("ch-analysis-run__stage--active", i === step);
        $stage.toggleClass("ch-analysis-run__stage--complete", i < step);
      });
      setProgress((step / stageCount) * 100);
      step += 1;
      window.setTimeout(advance, step >= stageCount ? (reduced ? 80 : 420) : stageDuration);
    }

    advance();
  }

  function getNewAnalysisRunContext() {
    var $visible = $(".ch-analysis-form-step:not(.d-none)").first();
    if (!$visible.length) {
      return { intent: "domain", input: "www.espn.com", target: "espn.com" };
    }
    var formId = $visible.attr("id") || "";
    if (formId === "ch-form-domain") {
      var domainRaw = ($("#domain-input").val() || "www.espn.com").trim();
      return { intent: "domain", input: domainRaw, target: normalizeDockDomain(domainRaw) || domainRaw };
    }
    if (formId === "ch-form-app") {
      var bundle = ($("#app-input").val() || "").trim() || "Bundle ID";
      return { intent: "bundle", input: bundle, target: bundle };
    }
    if (formId === "ch-form-brief") {
      return { intent: "brief", input: "", target: "Campaign brief" };
    }
    if (formId === "ch-form-creative") {
      return { intent: "creative", input: "", target: "Creative asset" };
    }
    if (formId === "ch-form-audience") {
      var audience = ($("#audience-idea").val() || "").trim() || "Audience segment";
      return { intent: "audience", input: audience, target: audience };
    }
    return { intent: "domain", input: "www.espn.com", target: "espn.com" };
  }

  function buildAnalysisRunPrompt(intent, input, target) {
    var text = (input || "").trim();
    if (intent === "bundle") {
      return "Evaluate Bundle ID " + (text || target);
    }
    if (intent === "brief") {
      return "Analyze campaign brief for cultural relevance";
    }
    if (intent === "creative") {
      return "Review creative for cultural fit";
    }
    if (intent === "audience") {
      return "Build analysis from audience: " + (text || target);
    }
    return "Give me CRS for " + (text || target);
  }

  function startAnalysisRun(opts) {
    opts = opts || {};
    if (analysisRunActive) return;
    analysisRunActive = true;

    var intent = opts.intent || "domain";
    var input = (opts.input || "").trim();
    var target = (opts.target || "").trim();
    if (!target) {
      target = intent === "domain" ? normalizeDockDomain(input) || input : input || "Analysis";
    }
    var href = (opts.href || "").trim() || getPagePrefix() + "analyses/espn-detail.html";
    var title = opts.title || "Generating cultural relevance analysis";
    var prompt = opts.prompt || buildAnalysisRunPrompt(intent, input, target);
    var stages = getAnalysisRunStages(intent);
    var mode = opts.mode || "dock";
    var $runRoot;

    lockAnalysisRunUi(true);
    if (opts.onStart) opts.onStart();

    if (mode === "overlay") {
      var $overlay = $('<div class="ch-analysis-run-overlay" role="dialog" aria-modal="true"></div>');
      $overlay.html(
        '<div class="ch-analysis-run-overlay__backdrop" aria-hidden="true"></div>' +
          '<div class="ch-analysis-run-overlay__card ch-card">' +
          '<div class="ch-card-body">' +
          buildAnalysisRunMarkup(title, target, stages) +
          "</div></div>"
      );
      $("body").append($overlay);
      requestAnimationFrame(function () {
        $overlay.addClass("ch-analysis-run-overlay--visible");
      });
      $runRoot = $overlay;
    } else {
      var $thread = $("#chCopilotThread");
      expandAiDock();
      $thread.prop("hidden", false);
      $("#chCopilotInput").val("").trigger("input");
      syncDockSuggestionsVisibility();
      appendChatUserBubble($thread, prompt);
      var $bubble = $(
        '<div class="ch-chat-bubble ch-chat-bubble-assistant ch-chat-bubble--appear ch-analysis-run"></div>'
      );
      $bubble.append(buildChatAuthorHtml("assistant"));
      $bubble.append(buildAnalysisRunMarkup(title, target, stages));
      $thread.append($bubble);
      scrollChatToEnd($thread);
      $runRoot = $bubble;
    }

    animateAnalysisRun($runRoot, stages, opts.durationMs || ANALYSIS_RUN_DURATION_MS, function () {
      analysisRunActive = false;
      try {
        sessionStorage.setItem(
          "ch-analysis-run-target",
          JSON.stringify({ intent: intent, target: target, input: input })
        );
        sessionStorage.removeItem(STORAGE_AI_DOCK);
      } catch (e) {
        /* ignore */
      }
      window.location.href = href;
    });
  }

  function analyzeCopilotMessage() {
    var text = ($("#chCopilotInput").val() || "").trim();
    var p = getPagePrefix();
    var intent = getAiDockIntent();
    var cfg = getAiDockIntentConfig(intent);

    if (cfg.ctaMode === "chat") {
      if (!text || text.length > 2000 || chatSession.generating) return;
      submitAiDockChat(text);
      return;
    }

    if (aiDockAttachedFile) {
      var fileType = aiDockAttachedFile.kind === "brief" ? "brief" : "creative";
      showToast(
        "Opening New Analysis with your " + (fileType === "brief" ? "brief" : "creative") + "…",
        "success"
      );
      clearAiDockFile();
      syncAiDockComposerState();
      window.location.href = buildNewAnalysisUrl(fileType);
      return;
    }

    if (!text || text.length > 2000) return;

    if (isWorkflowEntryPage() && intent === "domain" && looksLikeDomain(text)) {
      startAnalysisRun({
        mode: "dock",
        intent: "domain",
        input: text,
        target: normalizeDockDomain(text),
        href: p + "analyses/espn-detail.html",
      });
      return;
    }

    if (isWorkflowEntryPage() && intent === "bundle" && text.indexOf(" ") === -1) {
      startAnalysisRun({
        mode: "dock",
        intent: "bundle",
        input: text,
        target: text,
        href: p + "analyses/espn-detail.html",
      });
      return;
    }

    if (isWorkflowEntryPage() && intent === "audience") {
      showToast("Opening New Analysis with your audience hypothesis…", "success");
      window.location.href = buildNewAnalysisUrl("audience", text ? { audience: text } : null);
      return;
    }

    if (isWorkflowEntryPage() && (intent === "brief" || intent === "creative" || intent === "bundle")) {
      showToast("Opening New Analysis…", "success");
      window.location.href = buildNewAnalysisUrl(intent === "bundle" ? "app" : intent);
      return;
    }

    if (isWorkflowEntryPage()) {
      showToast(
        "Chat doesn’t create analyses here. Use the form above or enter a valid domain or Bundle ID.",
        "secondary"
      );
      return;
    }

    submitAiDockChat(text);
  }

  function initAiDock() {
    var $dock = $("#chAiDock");
    if (!$dock.length) return;

    ensureAiDockFab($dock);
    ensureDockPanelChrome();
    ensureDockIntentChrome();
    $("[data-ch-ai-dock-workflow-toggle]").remove();
    $("body").addClass("ch-has-ai-dock");
    if (!$dock.hasClass("ch-ai-dock--expanded")) {
      document.documentElement.style.setProperty("--ch-ai-dock-offset", AI_DOCK_COLLAPSED_OFFSET);
    }
    aiDockIntent = isWorkflowEntryPage() ? getDefaultAiDockIntent() : "ask";
    showAiDockIntentRow();
    restoreAiDockState();
    setAiDockIntent(aiDockIntent, { skipSuggestions: true, keepInput: true });
    syncAiDockComposerState();
    bindAiDockPersistence();
    playAiDockNavEnter();
    initAiDockFileInputs();

    var $input = $("#chCopilotInput");
    var $analyze = $("#chCopilotAnalyze");

    $input.on("input", function () {
      syncAiDockComposerState();
      scheduleDockSuggestionRefresh();
    });
    syncAiDockComposerState();

    $input.on("focus", function () {
      expandAiDock();
    });

    $(document).on("click", "[data-ch-ai-dock-intent]", function (e) {
      e.preventDefault();
      var intent = ($(this).attr("data-ch-ai-dock-intent") || "").trim();
      if (!intent) return;
      setAiDockIntent(intent);
      expandAiDock();
      setTimeout(function () {
        $input.trigger("focus");
      }, 50);
    });

    $(document).on("click", "[data-ch-ai-dock-expand], [data-ch-ai-dock-open]", function (e) {
      e.preventDefault();
      expandAiDock();
    });

    $(document).on("click", "[data-ch-ai-dock-collapse]", function (e) {
      e.preventDefault();
      e.stopPropagation();
      flashDockPanelAction("[data-ch-ai-dock-collapse]", "collapse");
      collapseAiDock();
    });

    $(document).on("keydown", function (e) {
      if (e.key !== "Escape" || !$dock.hasClass("ch-ai-dock--expanded")) return;
      if ($dock.hasClass("ch-ai-dock--fullscreen")) {
        setDockFullscreen(false);
        return;
      }
      collapseAiDock();
    });

    $analyze.on("click", analyzeCopilotMessage);

    $input.on("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!$analyze.prop("disabled")) analyzeCopilotMessage();
      }
    });

    requestAnimationFrame(function () {
      $dock.removeClass("ch-ai-dock--restoring");
    });
  }

  function openCopilotWithPrompt(prompt) {
    if (!$("#chAiDock").length) return;
    var text = (prompt || "").trim();

    if (isWorkflowEntryPage()) {
      setAiDockIntent("ask", { skipSuggestions: true, keepInput: true });
      expandAiDock();
      if (text) {
        submitAiDockChat(text);
      }
      return;
    }

    setAiDockIntent("ask", { skipSuggestions: true, keepInput: true });
    expandAiDock({ prompt: text });
    syncAiDockComposerState();
  }

  var copilotHandlersBound = false;

  function initCopilot(options) {
    options = options || {};
    var $dock = $("#chAiDock");
    if (!$dock.length) return;

    window.__chDockSuggestionOpts = options;
    var suggestionOpts = options;
    if (options.tabSuggestions) {
      suggestionOpts = $.extend({}, options, { activeTab: getActiveAnalysisTab() });
    }
    refreshDockSuggestions(suggestionOpts);

    if (options.tabSuggestions) {
      $("[data-bs-toggle=\"tab\"]").on("shown.bs.tab", function (e) {
        var target = $(e.target).attr("data-bs-target");
        refreshDockSuggestions({
          tabSuggestions: options.tabSuggestions,
          activeTab: target,
        });
      });
    }

    if (copilotHandlersBound) return;
    copilotHandlersBound = true;

    $(document).on("click", "[data-ch-copilot-prompt]", function () {
      openCopilotWithPrompt($(this).attr("data-ch-copilot-prompt") || "");
    });
  }

  function initEvidenceModal() {
    if (!$("#chEvidenceModal").length) return;

    $(document).on("click", "[data-ch-evidence]", function () {
      var key = $(this).attr("data-ch-evidence");
      var item = EVIDENCE_CONTENT[key];
      if (!item) return;
      $("#chEvidenceModalLabel").text(item.title);
      $("#chEvidenceModalScore").text(item.score);
      $("#chEvidenceModalBody").text(item.body);
      $("#chEvidenceModalAsk").attr("data-ch-copilot-prompt", item.askPrompt);
      bootstrap.Modal.getOrCreateInstance(document.getElementById("chEvidenceModal")).show();
    });
  }

  function initAnalysesList() {
    if (!$("#analyses-search").length) return;
    var $rows = $("[data-ch-analysis-row]");

    function filterRows() {
      var q = ($("#analyses-search").val() || "").trim().toLowerCase();
      var status = ($("#analyses-status").val() || "All statuses").trim();
      var visible = 0;
      $rows.each(function () {
        var $row = $(this);
        var searchText = ($row.attr("data-ch-searchable") || $row.text() || "").toLowerCase();
        var rowStatus = ($row.attr("data-ch-status") || "").trim();
        var matchSearch = !q || searchText.indexOf(q) !== -1;
        var matchStatus = status === "All statuses" || rowStatus === status;
        var show = matchSearch && matchStatus;
        $row.toggleClass("d-none", !show);
        if (show) visible += 1;
      });
      var hasFilter = q.length > 0 || status !== "All statuses";
      $("#chAnalysesEmpty").toggleClass("d-none", visible > 0 || !hasFilter);
      $("#chAnalysesTableWrap").toggleClass("d-none", visible === 0 && hasFilter);
    }

    $("#analyses-search").on("input", filterRows);
    $("#analyses-status").on("change", filterRows);
  }

  function initActivationsList() {
    if (!$("#activations-search").length) return;
    var $rows = $("[data-ch-activation-row]");

    function filterRows() {
      var q = ($("#activations-search").val() || "").trim().toLowerCase();
      var status = ($("#activations-status").val() || "All statuses").trim();
      var visible = 0;
      $rows.each(function () {
        var $row = $(this);
        var searchText = ($row.attr("data-ch-searchable") || $row.text() || "").toLowerCase();
        var rowStatus = ($row.attr("data-ch-status") || "").trim();
        var matchSearch = !q || searchText.indexOf(q) !== -1;
        var matchStatus = status === "All statuses" || rowStatus === status;
        var show = matchSearch && matchStatus;
        $row.toggleClass("d-none", !show);
        if (show) visible += 1;
      });
      var hasFilter = q.length > 0 || status !== "All statuses";
      $("#chActivationsEmpty").toggleClass("d-none", visible > 0 || !hasFilter);
      $("#chActivationsTableWrap").toggleClass("d-none", visible === 0 && hasFilter);
    }

    $("#activations-search").on("input", filterRows);
    $("#activations-status").on("change", filterRows);
  }

  var CH_ESPN_CAMPAIGN_MIX = {
    geo: [
      { label: "Southwest US", pct: 35 },
      { label: "California", pct: 20 },
      { label: "Texas", pct: 15 },
      { label: "Northeast US", pct: 10 },
      { label: "Other US regions", pct: 20 },
    ],
    platform: [
      { label: "Mobile Web & App", pct: 40 },
      { label: "CTV", pct: 30 },
      { label: "Display Ads", pct: 20 },
      { label: "Social Media", pct: 10 },
    ],
  };

  var CH_CAMPAIGN_KPIS = [
    { id: "ctr", label: "Click-Through Rate (CTR)", checked: true },
    { id: "engagement", label: "Engagement Rate", checked: true },
    { id: "sentiment", label: "Sentiment Lift", checked: true },
    { id: "time-on-site", label: "Time Spent on Site", checked: true },
    { id: "other", label: "Other", checked: false },
  ];

  var campaignMixEditSnapshot = null;
  var campaignPlanEditing = false;

  function chFaviconUrl(domain) {
    return (
      "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(domain) + "&sz=32"
    );
  }

  function cloneCampaignMix(mix) {
    return {
      geo: mix.geo.map(function (item) {
        return { label: item.label, pct: item.pct };
      }),
      platform: mix.platform.map(function (item) {
        return { label: item.label, pct: item.pct };
      }),
    };
  }

  function mixTotal(items) {
    return items.reduce(function (sum, item) {
      return sum + item.pct;
    }, 0);
  }

  function formatMixTotal(total) {
    if (total === 100) {
      return "Total: 100% ✓";
    }
    return "Total: " + total + "% (must equal 100%)";
  }

  function updateMixTotalDisplays(key, items) {
    var total = mixTotal(items);
    var valid = total === 100;
    var text = formatMixTotal(total);
    var suffix = key === "geo" ? "Geo" : "Platform";
    $("#ch" + suffix + "MixTotalView, #ch" + suffix + "MixTotalEdit").each(function () {
      var $el = $(this);
      $el.text(text);
      $el.toggleClass("ch-mix-total--invalid", !valid);
    });
    return valid;
  }

  var CH_CHART_COLORS = ["#1f69da", "#568de1", "#8db1e8", "#bdd1ef", "#1d4d96"];

  var campaignChartInstances = { geo: null, platform: null };

  function buildDoughnutChart(canvas, items, key) {
    if (!canvas || typeof Chart === "undefined") return null;
    if (campaignChartInstances[key]) {
      campaignChartInstances[key].destroy();
      campaignChartInstances[key] = null;
    }
    campaignChartInstances[key] = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: items.map(function (i) {
          return i.label;
        }),
        datasets: [
          {
            data: items.map(function (i) {
              return i.pct;
            }),
            backgroundColor: CH_CHART_COLORS.slice(0, items.length),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "58%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.label + ": " + ctx.parsed + "%";
              },
            },
          },
        },
      },
    });
    return campaignChartInstances[key];
  }

  function renderCampaignMixBars() {
    var $geoBars = $("#chGeoMixBars");
    var $platformBars = $("#chPlatformMixBars");
    function fillBars($container, items) {
      if (!$container.length) return;
      $container.empty();
      items.forEach(function (item) {
        $container.append(
          '<div class="mb-2"><div class="d-flex justify-content-between small mb-1"><span>' +
            item.label +
            '</span><span>' +
            item.pct +
            '%</span></div><div class="ch-metric-bar"><div class="ch-metric-bar__fill" style="width:' +
            item.pct +
            '%"></div></div></div>'
        );
      });
    }
    fillBars($geoBars, CH_ESPN_CAMPAIGN_MIX.geo);
    fillBars($platformBars, CH_ESPN_CAMPAIGN_MIX.platform);
    updateMixTotalDisplays("geo", CH_ESPN_CAMPAIGN_MIX.geo);
    updateMixTotalDisplays("platform", CH_ESPN_CAMPAIGN_MIX.platform);
  }

  function renderCampaignKpiBadges() {
    var $badges = $("#chCampaignKpiBadges");
    if (!$badges.length) return;
    $badges.empty();
    CH_CAMPAIGN_KPIS.forEach(function (kpi) {
      if (!kpi.checked) return;
      $badges.append(
        '<span class="badge rounded-pill text-bg-light border">' + kpi.label + "</span>"
      );
    });
  }

  function renderCampaignKpiCheckboxes() {
    var $edit = $("#chCampaignKpiEdit");
    if (!$edit.length) return;
    $edit.empty();
    CH_CAMPAIGN_KPIS.forEach(function (kpi) {
      var id = "ch-kpi-" + kpi.id;
      $edit.append(
        '<div class="form-check">' +
          '<input class="form-check-input" type="checkbox" id="' +
          id +
          '" data-ch-kpi-id="' +
          kpi.id +
          '"' +
          (kpi.checked ? " checked" : "") +
          " />" +
          '<label class="form-check-label small" for="' +
          id +
          '">' +
          kpi.label +
          "</label>" +
          "</div>"
      );
    });
  }

  function renderMixEditSliders(key, items) {
    var containerId = key === "geo" ? "#chGeoMixEdit" : "#chPlatformMixEdit";
    var $container = $(containerId);
    if (!$container.length) return;
    $container.empty();
    items.forEach(function (item, index) {
      var inputId = "ch-mix-" + key + "-" + index;
      $container.append(
        '<div class="ch-mix-slider-row" data-mix-key="' +
          key +
          '" data-mix-index="' +
          index +
          '">' +
          '<label class="ch-mix-slider-row__label" for="' +
          inputId +
          '">' +
          item.label +
          "</label>" +
          '<input type="range" class="form-range ch-mix-slider" id="' +
          inputId +
          '" min="0" max="100" step="1" value="' +
          item.pct +
          '" data-mix-key="' +
          key +
          '" data-mix-index="' +
          index +
          '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
          item.pct +
          '" aria-label="' +
          item.label +
          ' allocation" />' +
          '<span class="ch-mix-slider-row__pct" data-mix-pct="' +
          key +
          '">' +
          item.pct +
          "%</span>" +
          "</div>"
      );
    });
    updateMixTotalDisplays(key, items);
  }

  function campaignPlanMixValid() {
    if (!campaignMixEditSnapshot) return true;
    return (
      mixTotal(campaignMixEditSnapshot.geo) === 100 &&
      mixTotal(campaignMixEditSnapshot.platform) === 100
    );
  }

  function enterCampaignPlanEdit() {
    campaignPlanEditing = true;
    campaignMixEditSnapshot = cloneCampaignMix(CH_ESPN_CAMPAIGN_MIX);
    $("#chCampaignPlanView").addClass("d-none");
    $("#chCampaignPlanEdit").removeClass("d-none");
    $("#chCampaignObjectiveEdit").val($("#chCampaignObjective").val());
    $("#chCampaignAudienceEdit").val($("#chCampaignAudienceView").val());
    renderCampaignKpiCheckboxes();
    renderMixEditSliders("geo", campaignMixEditSnapshot.geo);
    renderMixEditSliders("platform", campaignMixEditSnapshot.platform);
    $("[data-ch-customize-plan]").text("Save Plan");
    $("[data-ch-cancel-plan]").removeClass("d-none");
  }

  function exitCampaignPlanEdit(save) {
    if (save && campaignMixEditSnapshot) {
      CH_ESPN_CAMPAIGN_MIX.geo = campaignMixEditSnapshot.geo.map(function (item) {
        return { label: item.label, pct: item.pct };
      });
      CH_ESPN_CAMPAIGN_MIX.platform = campaignMixEditSnapshot.platform.map(function (item) {
        return { label: item.label, pct: item.pct };
      });
      $("#chCampaignObjective").val($("#chCampaignObjectiveEdit").val());
      $("#chCampaignAudienceView").val($("#chCampaignAudienceEdit").val());
      CH_CAMPAIGN_KPIS.forEach(function (kpi) {
        kpi.checked = $("#ch-kpi-" + kpi.id).is(":checked");
      });
      renderCampaignKpiBadges();
      renderCampaignMixBars();
      initCampaignMixCharts();
      showToast("Campaign plan saved.", "success");
    }
    campaignPlanEditing = false;
    campaignMixEditSnapshot = null;
    $("#chCampaignPlanEdit").addClass("d-none");
    $("#chCampaignPlanView").removeClass("d-none");
    $("[data-ch-customize-plan]").text("Customize Plan");
    $("[data-ch-cancel-plan]").addClass("d-none");
  }

  function initBrandLogos() {
    $("[data-ch-brand-domain]").each(function () {
      var $el = $(this);
      var domain = $el.attr("data-ch-brand-domain");
      if (!domain) return;
      var $img = $el.is("img.ch-brand-logo") ? $el : $el.find("img.ch-brand-logo");
      if ($img.length) {
        $img.attr("src", chFaviconUrl(domain));
      }
    });

    $("#tab-inventory tbody tr").each(function () {
      var $td = $(this).find("td:first");
      if ($td.find(".ch-brand-mark").length) return;
      var domain = $td.text().trim();
      if (!domain || domain.indexOf(".") === -1) return;
      $td.html(
        '<span class="ch-brand-mark">' +
          '<img class="ch-brand-logo" src="' +
          chFaviconUrl(domain) +
          '" alt="" width="24" height="24" decoding="async" />' +
          '<span class="fw-semibold">' +
          domain +
          "</span></span>"
      );
    });
  }

  function initCampaignMixCharts() {
    if (!$("#chGeoChart").length) return;
    renderCampaignMixBars();
    buildDoughnutChart(document.getElementById("chGeoChart"), CH_ESPN_CAMPAIGN_MIX.geo, "geo");
    buildDoughnutChart(
      document.getElementById("chPlatformChart"),
      CH_ESPN_CAMPAIGN_MIX.platform,
      "platform"
    );
  }

  function initCustomizePlan() {
    if (!$("[data-ch-customize-plan]").length) return;

    renderCampaignKpiBadges();
    renderCampaignKpiCheckboxes();

    $(document).on("input", ".ch-mix-slider", function () {
      if (!campaignMixEditSnapshot) return;
      var key = $(this).attr("data-mix-key");
      var index = parseInt($(this).attr("data-mix-index"), 10);
      var pct = parseInt($(this).val(), 10) || 0;
      if (!key || isNaN(index)) return;
      campaignMixEditSnapshot[key][index].pct = pct;
      $(this).attr("aria-valuenow", pct);
      $(this)
        .closest(".ch-mix-slider-row")
        .find('[data-mix-pct="' + key + '"]')
        .text(pct + "%");
      updateMixTotalDisplays(key, campaignMixEditSnapshot[key]);
    });

    $(document).on("click", "[data-ch-mix-add]", function () {
      if (!campaignMixEditSnapshot) return;
      var key = $(this).attr("data-ch-mix-add");
      var labelId = key === "geo" ? "#chGeoMixAddLabel" : "#chPlatformMixAddLabel";
      var pctId = key === "geo" ? "#chGeoMixAddPct" : "#chPlatformMixAddPct";
      var label = ($(labelId).val() || "").trim();
      var pct = parseInt($(pctId).val(), 10);
      if (!label) {
        showToast("Enter a name for the row.", "warning");
        return;
      }
      if (isNaN(pct) || pct < 0 || pct > 100) {
        showToast("Enter a valid percent (0–100).", "warning");
        return;
      }
      var items = campaignMixEditSnapshot[key];
      var existing = items.find(function (item) {
        return item.label.toLowerCase() === label.toLowerCase();
      });
      if (existing) {
        existing.pct = pct;
      } else {
        items.push({ label: label, pct: pct });
      }
      $(labelId).val("");
      $(pctId).val("");
      renderMixEditSliders(key, items);
    });

    $(document).on("click", "[data-ch-mix-collapse]", function () {
      var key = $(this).attr("data-ch-mix-collapse");
      var bodyId = key === "geo" ? "#chGeoMixEditBody" : "#chPlatformMixEditBody";
      var $body = $(bodyId);
      var collapsed = $body.hasClass("d-none");
      $body.toggleClass("d-none", !collapsed);
      $(this).text(collapsed ? "Collapse" : "Expand");
    });

    $(document).on("click", "[data-ch-cancel-plan]", function () {
      if (!campaignPlanEditing) return;
      exitCampaignPlanEdit(false);
    });

    $(document).on("click", "[data-ch-customize-plan]", function () {
      if (!campaignPlanEditing) {
        enterCampaignPlanEdit();
        return;
      }
      if (!campaignPlanMixValid()) {
        showToast("Geo and platform mixes must each total 100%.", "warning");
        return;
      }
      exitCampaignPlanEdit(true);
    });

    $("#chBudgetCustomAmount").on("focus", function () {
      $("#chBudgetCustomRadio").prop("checked", true);
    });
  }

  function initCertificationsHub() {
    if (!$("[data-crs-cert-table-body]").length) return;
    import("../pages/certifications.js").then(function (mod) {
      if (typeof mod.initPage === "function") mod.initPage();
    });
  }

  function initAnalysisDetail() {
    if (!$("#analyses-detail").length) return;

    initBrandLogos();
    initCopilot({ tabSuggestions: ANALYSIS_COPILOT_SUGGESTIONS });

    import("../pages/analysis-detail.js").then(function (mod) {
      if (typeof mod.initPage === "function") mod.initPage();
    });
    import("../components/crs-certification-status.js").then(function (mod) {
      if (typeof mod.mountAnalysisCertificationStatus === "function") mod.mountAnalysisCertificationStatus();
    });

    var campaignTab = document.querySelector("#tab-campaign-plan-tab");
    if (campaignTab) {
      campaignTab.addEventListener("shown.bs.tab", function () {
        initCampaignMixCharts();
      });
    }

    $(document).on("click", "[data-ch-submit-feedback]", function () {
      showToast("Thank you. Your feedback helps improve future evaluations.", "success");
    });

    function showAnalysisTab(target) {
      if (!target || typeof bootstrap === "undefined") return;
      var tabBtn = document.querySelector('#analyses-detail .nav-tabs [data-bs-target="' + target + '"]');
      if (!tabBtn) return;
      bootstrap.Tab.getOrCreateInstance(tabBtn).show();
      var workspace = document.querySelector(".ch-analysis-workspace");
      if (workspace) workspace.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $(document).on("click", "[data-ch-goto-tab]", function () {
      showAnalysisTab($(this).attr("data-ch-goto-tab"));
    });

    $(document).on("click", "[data-ch-goto-activation]", function () {
      showAnalysisTab("#tab-activation");
    });

    $(document).on("click", "[data-ch-show-score-breakdown]", function () {
      var tabBtn = document.querySelector('#analyses-detail .nav-tabs [data-bs-target="#tab-overview"]');
      if (tabBtn && typeof bootstrap !== "undefined") {
        bootstrap.Tab.getOrCreateInstance(tabBtn).show();
      }
      var breakdown = document.getElementById("overview-score-breakdown");
      if (!breakdown) return;
      window.setTimeout(function () {
        breakdown.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    });

    $(document).on("click", "#chDealSubmit", function () {
      var el = document.getElementById("chDealModal");
      if (el && typeof bootstrap !== "undefined") {
        var inst = bootstrap.Modal.getInstance(el) || bootstrap.Modal.getOrCreateInstance(el);
        inst.hide();
      }
      showToast("Deal created. Confirmation sent to your email and DSP.", "success");
    });

    activateTabFromHash();
    if (document.querySelector("#tab-campaign-plan.show")) {
      initCampaignMixCharts();
    }
    window.addEventListener("hashchange", function () {
      activateTabFromHash();
      if (window.location.hash === "#tab-campaign-plan") {
        initCampaignMixCharts();
      }
    });

    $(document).on("change", ".ch-inventory-toggle", function () {
      var count = $(".ch-inventory-toggle:checked").length;
      $("#chInventoryCount").text(count + " of 13 selected");
    });

    $(document).on("click", "[data-ch-export]", function () {
      showToast("Export ready.", "secondary");
    });
    $(document).on("click", "[data-ch-share]", function () {
      showToast("Share link copied.", "secondary");
    });
    $(document).on("click", "[data-ch-download-pdf]", function () {
      showToast("Blueprint PDF downloaded.", "secondary");
    });

    $(document).on("click", "[data-ch-rename]", function () {
      var current = ($("#analyses-detail h1").first().text() || "").trim();
      var next = window.prompt("Rename analysis", current);
      if (next === null) return;
      next = next.trim();
      if (!next) {
        showToast("Name cannot be empty.", "warning");
        return;
      }
      $("#analyses-detail h1").first().text(next);
      showToast("Analysis renamed.", "success");
    });

    $(document).on("click", "[data-ch-duplicate]", function () {
      showToast("Analysis duplicated. The copy is in your Analyses list.", "success");
    });

    $(document).on("click", "#chDeleteAnalysisConfirm", function () {
      showToast("Analysis deleted.", "secondary", {
        actionLabel: "Undo",
        delay: 8000,
        onAction: function () {
          showToast("Delete undone. Analysis restored.", "success");
        },
      });
    });
  }

  function initCopilotPages() {
    if ($("#analyses-detail").length) return;
    initCopilot();
  }

  function setAnalysisStepperStep(step) {
    $(".ch-analysis-stepper__step").each(function () {
      var n = parseInt($(this).attr("data-ch-analysis-step"), 10);
      $(this)
        .toggleClass("ch-analysis-stepper__step--active", n === step)
        .toggleClass("ch-analysis-stepper__step--complete", n < step);
    });
  }

  function selectNewAnalysisInputType(type) {
    var $card = $(".ch-input-type-card[data-ch-input-type='" + type + "']");
    if (!$card.length) return;
    $(".ch-input-type-card").removeClass("selected").attr("aria-pressed", "false");
    $card.addClass("selected").attr("aria-pressed", "true");
    $(".ch-analysis-form-step").addClass("d-none");
    $("#ch-form-" + type).removeClass("d-none");
    setAnalysisStepperStep(2);

    var stepEl = document.getElementById("ch-new-analysis-step-2");
    if (stepEl) stepEl.scrollIntoView({ behavior: "smooth", block: "start" });

    var $focus = $("#ch-form-" + type).find("input, textarea").first();
    if ($focus.length) {
      setTimeout(function () {
        $focus.trigger("focus");
      }, 350);
    }
  }

  function getTimeOfDayGreeting() {
    var hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function initDashboardGreeting() {
    var $el = $("#chDashboardGreeting");
    if (!$el.length) return;
    var firstName = ($("body").attr("data-ch-user-first-name") || "").trim();
    if (!firstName) {
      var fullName = $(".ch-sidebar-footer .ch-user-meta .fw-semibold").first().text().trim();
      firstName = fullName.split(/\s+/)[0] || "";
    }
    $el.text(getTimeOfDayGreeting() + (firstName ? ", " + firstName : ""));
  }

  function initNewAnalysis() {
    if (!$("#page-new-analysis").length) return;
    setAnalysisStepperStep(1);

    $(document).on("click", "[data-ch-generate-analysis]", function (e) {
      e.preventDefault();
      var $btn = $(this);
      if ($btn.attr("data-ch-generating") === "true" || analysisRunActive) return;
      var href = ($btn.attr("href") || "espn-detail.html").trim();
      var ctx = getNewAnalysisRunContext();
      $btn.attr("data-ch-generating", "true");
      startAnalysisRun({
        mode: "overlay",
        intent: ctx.intent,
        input: ctx.input,
        target: ctx.target,
        href: href,
        onStart: function () {
          setAnalysisStepperStep(3);
        },
      });
    });

    $(document).on("click", ".ch-input-type-card", function () {
      selectNewAnalysisInputType($(this).attr("data-ch-input-type"));
    });

    applyNewAnalysisDeepLink();
  }
export function initWorkspace() {
  domReady(function () {
    layoutHighlightNav();
    layoutInitNavGroups();
    layoutInitSidebarCollapse();
    layoutInitTopbarHistoryNav();
    initToastDemo();
    initFoundationsPage();
    initAiGeneratingDemo();
    initDropzoneDemo();
    initMarkedChat();
    initAuthGate();
    initLogout();
    initAudienceGate();
    initAudienceCatalog();
    initUserAudienceEditor();
    initSaveAudienceSegment();
    initAudiencesLibrary();
    initChatComposer();
    initStarterPrompts();
    initGlobalCommandPalette();
    initChatHistoryDrawer();
    initPromptBrowser();
    initLocaleSelect();
    initAccountMenu();
    syncLocaleMenuVisibility();
    initHelpModal();
    initUpgradeModal();
    initDevNav();
    layoutInitNavDestinations();
    initLibraryFileList();
    initProcessedCsvPage();
    initCertificationsHub();
    initAiDock();
    initCopilotPages();
    initEvidenceModal();
    initAnalysesList();
    initActivationsList();
    initBrandLogos();
    initCustomizePlan();
    initAnalysisDetail();
    initNewAnalysis();
    initDashboardGreeting();
    initDataModeSettings();
    applyDataModeUi();
  });
}
