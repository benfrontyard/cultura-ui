/**
 * Cultura prototype: jQuery + Bootstrap 5 helpers (auth gate, nav, chat UI, tables).
 */
(function ($) {
  "use strict";

  var STORAGE_SIDEBAR = "ch-sidebar-collapsed";
  var STORAGE_SESSION = "ch_session";
  var STORAGE_LOCALE = "ch_locale";

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
      var msg = $(this).attr("data-ch-toast-message") || "Action completed.";
      var variant = $(this).attr("data-ch-toast-variant") || "secondary";
      showToast(msg, variant);
    });
  }

  function showToast(message, variant) {
    variant = variant || "primary";
    var $host = $("#chToastHost");
    if (!$host.length || typeof bootstrap === "undefined") return;

    var id = "chToast-" + Date.now();
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
      '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Dismiss notification"></button>' +
      "</div></div>";

    $host.append(html);
    var el = document.getElementById(id);
    if (!el) return;
    var toast = new bootstrap.Toast(el, { delay: 4500 });
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

  /** Login vs sign-up panel on #chAuthGate (Assistant preview only). */
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
      lead.textContent = isSignup
        ? "Create your workspace. This preview does not create real accounts."
        : "Enter your details to open the workspace.";
    }
    if (hint) {
      hint.textContent = isSignup
        ? "This preview uses a local session only. You can continue with empty fields on Assistant."
        : "This preview uses a local session only. On Assistant you can also log in with empty fields to explore the layout.";
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
      var assistantPreview = getCurrentPage() === "ai-chat";
      if ((!email || !password) && !assistantPreview) {
        showToast("Enter your email and password to continue.", "danger");
        return;
      }
      setSession(true);
      applyAuthVisibility();
      showToast(
        assistantPreview && (!email || !password)
          ? "Opening the Assistant workspace for preview."
          : "Signed in. Welcome back.",
        "success"
      );
      if (assistantPreview) {
        setTimeout(function () {
          var ta = document.getElementById("chat-input");
          if (ta) {
            ta.focus();
            try {
              ta.scrollIntoView({ block: "nearest", behavior: "smooth" });
            } catch (err) {
              ta.scrollIntoView(false);
            }
          }
        }, 100);
      }
    });

    $("#chSignupForm").on("submit", function (e) {
      e.preventDefault();
      var email = ($("#chSignupEmail").val() || "").trim();
      var password = ($("#chSignupPassword").val() || "").trim();
      var assistantPreview = getCurrentPage() === "ai-chat";
      if ((!email || !password) && !assistantPreview) {
        showToast("Enter your email and password to continue.", "danger");
        return;
      }
      setSession(true);
      applyAuthVisibility();
      setAuthGateMode("login");
      showToast(
        assistantPreview && (!email || !password)
          ? "Opening the Assistant workspace for preview."
          : "Account created. Welcome to Culture Hive (preview).",
        "success"
      );
      if (assistantPreview) {
        setTimeout(function () {
          var ta = document.getElementById("chat-input");
          if (ta) {
            ta.focus();
            try {
              ta.scrollIntoView({ block: "nearest", behavior: "smooth" });
            } catch (err2) {
              ta.scrollIntoView(false);
            }
          }
        }, 100);
      }
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
      showToast("Password reset is not available in this preview build.", "secondary");
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
      var path = window.location.pathname || "";
      var dest = "chat/index.html?ch_auth=signup";
      if (path.indexOf("processed-csvs") !== -1) dest = "../chat/index.html?ch_auth=signup";
      window.location.href = dest;
    });
  }

  var audiencePending = null;

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
      filterAudienceList("");
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
      if (!$modal.find(".ch-audience-row.is-active").length) {
        showToast("Select an audience to continue.", "warning");
        return;
      }
      modal.hide();
      if (audiencePending && audiencePending.modalSelector) {
        var $m = $(audiencePending.modalSelector);
        if ($m.length) bootstrap.Modal.getOrCreateInstance($m[0]).show();
      } else if (audiencePending && audiencePending.href) {
        window.location.href = audiencePending.href;
      }
      audiencePending = null;
    });
  }

  function filterAudienceList(q) {
    $("#chAudienceList .ch-audience-row").each(function () {
      var t = ($(this).attr("data-ch-audience-name") || "").toLowerCase();
      var hide = q.length > 0 && t.indexOf(q) === -1;
      $(this).closest("li").toggleClass("d-none", hide);
    });
  }

  function getPrototypeMarkdownSource() {
    var $src = $("#chMarkdownSource");
    if (!$src.length) return "";
    return String($src.text() || "").trim();
  }

  function appendChatUserBubble($scroll, text) {
    var $bubble = $('<div class="ch-chat-bubble ch-chat-bubble-user ch-chat-bubble--appear"></div>');
    $bubble.append('<div class="ch-chat-bubble__meta text-ch-muted">You</div>');
    $bubble.append($("<div/>", { class: "ch-chat-markdown" }).append($("<p/>", { class: "mb-0", text: text })));
    $scroll.append($bubble);
  }

  function appendChatAssistantBubble($scroll, options) {
    options = options || {};
    var $bubble = $('<div class="ch-chat-bubble ch-chat-bubble-assistant ch-chat-bubble--appear"></div>');
    $bubble.append('<div class="ch-chat-bubble__meta text-ch-muted">Culture Hive AI</div>');
    var $body = $("<div/>", { class: "ch-chat-markdown" });
    if (options.html) {
      $body.html(options.html);
    } else {
      $body.append($("<p/>", { class: "mb-0", text: options.text || "" }));
    }
    $bubble.append($body);
    if (options.actions) {
      var $actions = $('<div class="ch-chat-actions" role="group" aria-label="Message actions"></div>');
      ["Save", "Export", "Create Persona", "Create Report"].forEach(function (label) {
        $actions.append(
          $('<button type="button" class="btn btn-sm btn-light border ch-chat-actions__btn"></button>').text(label)
        );
      });
      $bubble.append($actions);
    }
    $scroll.append($bubble);
  }

  function scrollChatToEnd($scroll) {
    var el = $scroll && $scroll.length ? $scroll[0] : null;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
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
        $send.prop("disabled", len === 0 || len > 2000);
      }
    }

    $ta.on("input", sync);
    sync();

    $send.on("click", function () {
      if ($send.prop("disabled")) return;

      if (!hasThreadUi) {
        showToast("Live model responses are not enabled in this preview build.", "secondary");
        return;
      }

      var msg = ($ta.val() || "").trim();
      if (!msg || msg.length > 2000) return;

      appendChatUserBubble($scroll, msg);

      var isFirst = !$page.hasClass("ch-chat-page--active");
      if (isFirst) {
        $page.addClass("ch-chat-page--active");
        $threadSection.attr("aria-hidden", "false");
        $(".ch-chat-page-empty").attr("aria-hidden", "true");
        var raw = getPrototypeMarkdownSource();
        var html = "";
        if (raw && typeof marked !== "undefined") {
          html = marked.parse(raw);
        } else if (raw) {
          html = "<pre class=\"mb-0\">" + String(raw).replace(/</g, "&lt;") + "</pre>";
        } else {
          html = "<p class=\"mb-0 text-ch-secondary\">Sample reply is not available in this preview build.</p>";
        }
        appendChatAssistantBubble($scroll, { html: html, actions: true });
      } else {
        appendChatAssistantBubble($scroll, {
          text: "Follow-up replies are not generated in this preview. Continue in your workspace or refine your prompt for the next blueprint pass.",
        });
      }

      $ta.val("").trigger("input");
      scrollChatToEnd($scroll);
      $ta.trigger("focus");
    });
  }

  function initStarterPrompts() {
    $(document).on("click", "[data-ch-starter-prompt]", function () {
      var text = $(this).attr("data-ch-starter-prompt") || $(this).text();
      var sel = $(this).attr("data-ch-prompt-target");
      var $ta = sel ? $(sel) : $("#chat-input");
      if (!$ta.length) $ta = $("#home-ai-input");
      if ($ta.length) {
        $ta.val(text).trigger("input");
        $ta[0].focus();
      }
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
    $(document).on("click", "[data-ch-new-chat]", function () {
      var $ta = $("#chat-input");
      var $page = $("#chChatPage");
      var $scroll = $("#chChatScroll");
      var $threadSection = $(".ch-chat-thread-section");

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
      showToast("Language preference saved. Additional locales are not available in this preview.", "secondary");
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

  function initDevNav() {
    if (/\bdev=1\b/.test(window.location.search || "")) {
      $(".ch-dev-only-nav").removeClass("d-none");
    }
  }

  function initBlueprintPlaceholder() {
    $(document).on("click", 'a[data-ch-nav="blueprint"]', function (e) {
      if ($(this).attr("href") === "#") {
        e.preventDefault();
        showToast("Cultural Blueprint routing is not connected in this preview build.", "secondary");
      }
    });
  }

  function initProcessedCsvPage() {
    if (!$("#chCsvTableBody").length) return;

    var rows = [
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
      },
      {
        file: "sustainable-home-panel.csv",
        uploaded: "2026-05-11 11:05",
        processed: "2026-05-11 11:06",
        status: "Failed",
      },
      {
        file: "urban-design-geo-baseline.csv",
        uploaded: "2026-05-08 08:00",
        processed: "2026-05-08 08:02",
        status: "Ready",
      },
    ];

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

      var $tb = $("#chCsvTableBody");
      var $empty = $("#chCsvEmpty");
      $tb.empty();

      if (!list.length) {
        $empty.removeClass("d-none");
        return;
      }
      $empty.addClass("d-none");

      list.forEach(function (r) {
        var safeFile = String(r.file).replace(/</g, "&lt;");
        var pillClass =
          r.status === "Ready"
            ? "ch-pill ch-pill-success"
            : r.status === "Failed"
              ? "ch-pill ch-pill-danger"
              : "ch-pill ch-pill-warning";
        var aria = "Actions for " + String(r.file).replace(/"/g, "&quot;");
        $tb.append(
          "<tr>" +
            "<td class=\"fw-semibold\">" +
            safeFile +
            "</td>" +
            "<td class=\"text-ch-secondary\">" +
            r.uploaded +
            "</td>" +
            "<td class=\"text-ch-secondary\">" +
            r.processed +
            "</td>" +
            "<td><span class=\"" +
            pillClass +
            "\">" +
            r.status +
            "</span></td>" +
            "<td class=\"text-end\">" +
            "<div class=\"dropdown\">" +
            "<button type=\"button\" class=\"btn btn-sm btn-light border\" data-bs-toggle=\"dropdown\" aria-expanded=\"false\" aria-label=\"" +
            aria +
            "\">" +
            "<svg class=\"ch-icon\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#ch-dots-vertical\"/></svg>" +
            "</button>" +
            "<ul class=\"dropdown-menu dropdown-menu-end\">" +
            "<li><a class=\"dropdown-item\" href=\"#\">Download</a></li>" +
            "<li><a class=\"dropdown-item\" href=\"#\">View</a></li>" +
            "</ul>" +
            "</div>" +
            "</td>" +
            "</tr>"
        );
      });
    }

    $("#chCsvFilter").on("input", render);

    $("#chCsvSort").on("change", function () {
      var v = $(this).val() || "file";
      if (v === "file-desc") {
        sortKey = "file";
        sortDir = -1;
      } else if (v === "file-asc") {
        sortKey = "file";
        sortDir = 1;
      } else if (v === "uploaded-desc") {
        sortKey = "uploaded";
        sortDir = -1;
      } else if (v === "uploaded-asc") {
        sortKey = "uploaded";
        sortDir = 1;
      } else if (v === "processed-desc") {
        sortKey = "processed";
        sortDir = -1;
      } else if (v === "processed-asc") {
        sortKey = "processed";
        sortDir = 1;
      } else if (v === "status-asc") {
        sortKey = "status";
        sortDir = 1;
      } else if (v === "status-desc") {
        sortKey = "status";
        sortDir = -1;
      }
      render();
    });

    render();
  }

  var COPILOT_PAGE_SUGGESTIONS = {
    home: [
      "What should I analyze next?",
      "Resume my last analysis",
      "Explain how CRS scoring works",
    ],
    analyses: [
      "Compare ESPN vs Nike brief",
      "Filter activation-ready analyses",
      "What makes a strong CRS score?",
    ],
    "analyses-new": [
      "What input type fits a CTV app?",
      "Suggest audience for espn.com",
      "How does domain analysis work?",
    ],
    audiences: [
      "How does Diego Ramirez affect CRS?",
      "What stereotypes should we avoid?",
      "Use this segment in a new analysis",
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
      score: "32/40",
      body:
        "Latino millennial sports fans over-index on ESPN digital properties for highlight consumption, live scores, and fantasy participation. Bilingual content paths and athlete storytelling drive repeat visits.",
      askPrompt: "Explain the audience alignment score for ESPN.com",
    },
    "ownership-authenticity": {
      title: "Ownership & Authenticity",
      score: "20/25",
      body:
        "ESPN maintains credible sports authority with growing Spanish-language verticals (espndeportes.com) and community-driven commentary features that signal authentic engagement.",
      askPrompt: "How does ESPN demonstrate ownership and authenticity?",
    },
    "editorial-ux": {
      title: "Editorial/UX Signals",
      score: "18/25",
      body:
        "Mobile-first layout, personalized team feeds, and highlight clips align with daily sports rituals. UX patterns support quick score checks and shareable moments.",
      askPrompt: "What editorial and UX signals support the CRS score?",
    },
    "intersectional-representation": {
      title: "Intersectional Representation",
      score: "12/15",
      body:
        "Coverage spans soccer, baseball, and basketball with Latino athlete spotlights and bilingual commentary. Representation extends beyond tokenism into sustained narrative coverage.",
      askPrompt: "How well does ESPN represent intersectional sports audiences?",
    },
  };

  function renderCopilotSuggestions(prompts) {
    var $list = $("#chCopilotSuggestions");
    if (!$list.length) return;
    $list.empty();
    prompts.forEach(function (p) {
      $list.append(
        '<button type="button" class="ch-suggested-prompt w-100 text-start mb-1" data-ch-copilot-prompt="' +
          p.replace(/"/g, "&quot;") +
          '">' +
          p +
          "</button>"
      );
    });
  }

  function copilotReplyForMessage(text, context) {
    var t = (text || "").toLowerCase();
    context = context || "";
    if (context.indexOf("ESPN") !== -1 || $("#analyses-espn-detail").length) {
      if (t.indexOf("improve") !== -1 || t.indexOf("score") !== -1) {
        return (
          "ESPN.com scores 82 primarily on audience alignment (32/40) and ownership signals (20/25). " +
          "To improve: expand Spanish-language inventory, add more intersectional athlete narratives, and pair with community sports publishers."
        );
      }
      return (
        "ESPN.com scores 82 for Latino millennial sports fans due to strong bilingual coverage, athlete storytelling, and high-intent sports environments."
      );
    }
    if (context.indexOf("Dashboard") !== -1 || getCurrentPage() === "home") {
      if (t.indexOf("resume") !== -1) {
        return "Your most recent analysis is ESPN.com Evaluation (CRS 82, completed Jun 4). Open it from Recent Analyses to continue toward activation.";
      }
      return "Start with New Analysis to evaluate a domain, brief, or creative. Quick Start cards on the dashboard map to common workflows.";
    }
    if (context.indexOf("Analyses") !== -1 && getCurrentPage() === "analyses") {
      return "Three analyses are in your workspace. ESPN.com Evaluation (82) is activation-ready. Use filters to narrow by status or search by audience.";
    }
    if (getCurrentPage() === "analyses-new") {
      return "Choose an input type that matches your starting point — domain for publisher evaluation, brief for campaign planning, or audience for segment-first analysis.";
    }
    if (getCurrentPage() === "audiences") {
      return "Audience segments inform CRS scoring and inventory curation. Select a segment, then start a New Analysis to evaluate cultural fit for your target.";
    }
    return (
      "I can help explain CRS scores, summarize analyses for clients, or guide you through persona, inventory, and activation steps in the structured workspace."
    );
  }

  function openCopilotWithPrompt(prompt) {
    var drawer = document.getElementById("chCopilotDrawer");
    if (!drawer || typeof bootstrap === "undefined") return;
    bootstrap.Offcanvas.getOrCreateInstance(drawer).show();
    setTimeout(function () {
      $("#chCopilotInput").val(prompt || "").trigger("input");
    }, 300);
  }

  var copilotHandlersBound = false;

  function initCopilot(options) {
    options = options || {};
    var $drawer = $("#chCopilotDrawer");
    if (!$drawer.length) return;

    var context =
      $("body").attr("data-ch-copilot-context") || options.contextLabel || "Workspace";
    $drawer.find(".ch-copilot-context-text").text("Using " + context);

    if (options.tabSuggestions) {
      renderCopilotSuggestions(options.tabSuggestions["#tab-overview"] || []);
      $("[data-bs-toggle=\"tab\"]").on("shown.bs.tab", function (e) {
        var target = $(e.target).attr("data-bs-target");
        var prompts = options.tabSuggestions[target] || [];
        renderCopilotSuggestions(prompts);
      });
    } else {
      var page = getCurrentPage();
      var prompts = options.suggestions || COPILOT_PAGE_SUGGESTIONS[page] || [];
      renderCopilotSuggestions(prompts);
    }

    if (copilotHandlersBound) return;
    copilotHandlersBound = true;

    $(document).on("click", "[data-ch-copilot-prompt]", function () {
      openCopilotWithPrompt($(this).attr("data-ch-copilot-prompt"));
    });

    $(document).on("click", "#chCopilotSend", function () {
      var text = $("#chCopilotInput").val().trim();
      if (!text) return;
      var $thread = $("#chCopilotThread");
      var ctx = $("body").attr("data-ch-copilot-context") || "";
      appendChatUserBubble($thread, text);
      appendChatAssistantBubble($thread, { text: copilotReplyForMessage(text, ctx) });
      $("#chCopilotInput").val("");
      scrollChatToEnd($thread);
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
      $rows.each(function () {
        var $row = $(this);
        var searchText = ($row.attr("data-ch-searchable") || $row.text() || "").toLowerCase();
        var rowStatus = ($row.attr("data-ch-status") || "").trim();
        var matchSearch = !q || searchText.indexOf(q) !== -1;
        var matchStatus = status === "All statuses" || rowStatus === status;
        $row.toggleClass("d-none", !(matchSearch && matchStatus));
      });
    }

    $("#analyses-search").on("input", filterRows);
    $("#analyses-status").on("change", filterRows);
  }

  function initCustomizePlan() {
    if (!$("[data-ch-customize-plan]").length) return;
    var editing = false;

    $(document).on("click", "[data-ch-customize-plan]", function () {
      var $btn = $(this);
      var $field = $("#chCampaignObjective");
      if (!$field.length) return;
      if (!editing) {
        $field.prop("readonly", false).focus();
        $btn.text("Save Plan");
        editing = true;
        return;
      }
      $field.prop("readonly", true);
      $btn.text("Customize Plan");
      editing = false;
      showToast("Campaign plan saved.", "success");
    });
  }

  function initAnalysisDetail() {
    if (!$("#analyses-espn-detail").length) return;

    initCopilot({ tabSuggestions: ANALYSIS_COPILOT_SUGGESTIONS });

    $(document).on("click", "[data-ch-goto-tab]", function () {
      var target = $(this).attr("data-ch-goto-tab");
      if (!target) return;
      var tabBtn = document.querySelector('[data-bs-target="' + target + '"]');
      if (tabBtn) {
        bootstrap.Tab.getOrCreateInstance(tabBtn).show();
        var pane = document.querySelector(target);
        if (pane) pane.scrollIntoView({ behavior: "smooth" });
      }
    });

    $(document).on("click", "[data-ch-goto-activation]", function () {
      bootstrap.Tab.getOrCreateInstance(document.querySelector("#tab-activation-tab")).show();
      document.querySelector("#tab-activation").scrollIntoView({ behavior: "smooth" });
    });

    $(document).on("click", "#chDealSubmit", function () {
      bootstrap.Modal.getInstance(document.getElementById("chDealModal")).hide();
      showToast("Deal created. Confirmation sent to your DSP.", "success");
    });

    $(document).on("change", ".ch-inventory-toggle", function () {
      var count = $(".ch-inventory-toggle:checked").length;
      $("#chInventoryCount").text(count + " of 13 selected");
    });

    $(document).on("click", "[data-ch-save-audience]", function () {
      showToast("Audience segment saved to your workspace.", "success");
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
  }

  function initCopilotPages() {
    if ($("#analyses-espn-detail").length) return;
    initCopilot();
  }

  function initNewAnalysis() {
    if (!$("#page-new-analysis").length) return;
    $(document).on("click", ".ch-input-type-card", function () {
      $(".ch-input-type-card").removeClass("selected");
      $(this).addClass("selected");
      var type = $(this).attr("data-ch-input-type");
      $(".ch-analysis-form-step").addClass("d-none");
      $("#ch-form-" + type).removeClass("d-none");
    });
  }

  $(function () {
    highlightNav();
    initNavGroups();
    initSidebarCollapse();
    initTopbarHistoryNav();
    initToastDemo();
    initFoundationsPage();
    initAiGeneratingDemo();
    initDropzoneDemo();
    initMarkedChat();
    initAuthGate();
    initLogout();
    initAudienceGate();
    initChatComposer();
    initStarterPrompts();
    initGlobalCommandPalette();
    initChatHistoryDrawer();
    initPromptBrowser();
    initLocaleSelect();
    initAccountMenu();
    syncLocaleMenuVisibility();
    initHelpModal();
    initDevNav();
    initBlueprintPlaceholder();
    initProcessedCsvPage();
    initCopilotPages();
    initEvidenceModal();
    initAnalysesList();
    initCustomizePlan();
    initAnalysisDetail();
    initNewAnalysis();
  });
})(window.jQuery);
