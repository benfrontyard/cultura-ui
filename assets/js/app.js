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
    $(".ch-nav-link[data-ch-nav]").each(function () {
      var $link = $(this);
      var key = ($link.attr("data-ch-nav") || "").trim();
      $link.toggleClass("active ch-nav-active", key === current);
    });
    $(".ch-nav-link[data-ch-nav]").removeAttr("aria-current");
    var $match = $(".ch-nav-link[data-ch-nav]").filter(function () {
      return ($(this).attr("data-ch-nav") || "").trim() === current;
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

  function initToastDemo() {
    $(document).on("click", "[data-ch-demo-toast]", function (e) {
      e.preventDefault();
      showToast("Saved successfully. This is a demo toast.", "primary");
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
    var $zone = $("[data-ch-dropzone]");
    if (!$zone.length) return;

    $zone.on("dragenter dragover", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $zone.addClass("ch-dropzone-active");
    });

    $zone.on("dragleave", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $zone.removeClass("ch-dropzone-active");
    });

    $zone.on("drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $zone.removeClass("ch-dropzone-active");
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

  function applyAuthVisibility() {
    var $gate = $("#chAuthGate");
    var $app = $("#chWorkspaceApp");
    if (!$gate.length || !$app.length) return;

    if (hasSession()) {
      $gate.addClass("d-none").attr("aria-hidden", "true");
      $app.removeClass("d-none").attr("aria-hidden", "false");
    } else {
      $gate.removeClass("d-none").attr("aria-hidden", "false");
      $app.addClass("d-none").attr("aria-hidden", "true");
    }
  }

  function initAuthGate() {
    if (!$("#chAuthGate").length) return;

    applyAuthVisibility();

    $("#chLoginForm").on("submit", function (e) {
      e.preventDefault();
      var email = ($("#chLoginEmail").val() || "").trim();
      var password = ($("#chLoginPassword").val() || "").trim();
      if (!email || !password) {
        showToast("Enter email and password to continue (prototype).", "danger");
        return;
      }
      setSession(true);
      applyAuthVisibility();
      showToast("Signed in (prototype session).", "success");
    });

    $(document).on("click", "[data-ch-register-placeholder], [data-ch-forgot-placeholder]", function (e) {
      e.preventDefault();
      showToast("Registration and password reset are not wired in this prototype.", "secondary");
    });
  }

  function initLogout() {
    $(document).on("click", "[data-ch-logout]", function (e) {
      e.preventDefault();
      setSession(false);
      var $gate = $("#chAuthGate");
      if ($gate.length && $("#chWorkspaceApp").length) {
        applyAuthVisibility();
        var form = document.getElementById("chLoginForm");
        if (form) form.reset();
        showToast("Logged out.", "secondary");
        return;
      }
      showToast("Logged out. Opening sign-in…", "secondary");
      var path = window.location.pathname || "";
      var dest = "chat/";
      if (path.indexOf("processed-csvs") !== -1) dest = "../chat/";
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
      modal.show();
    });

    if (!$modal.length || typeof bootstrap === "undefined") return;

    var modal = bootstrap.Modal.getOrCreateInstance($modal[0]);

    $("#chAudienceSearch").on("input", function () {
      filterAudienceList(($(this).val() || "").trim().toLowerCase());
    });

    $modal.on("click", ".ch-audience-row", function () {
      $modal.find(".ch-audience-row").removeClass("is-active");
      $(this).addClass("is-active");
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
      $(this).toggleClass("d-none", q.length > 0 && t.indexOf(q) === -1);
    });
  }

  function getPrototypeMarkdownSource() {
    var $src = $("#chMarkdownSource");
    if (!$src.length) return "";
    return String($src.text() || "").trim();
  }

  function appendChatUserBubble($scroll, text) {
    var $bubble = $('<div class="ch-chat-bubble ch-chat-bubble-user"></div>');
    $bubble.append('<div class="small text-ch-muted mb-1">You</div>');
    $bubble.append($("<p/>", { class: "mb-0", text: text }));
    $scroll.append($bubble);
  }

  function appendChatAssistantBubble($scroll, options) {
    options = options || {};
    var $bubble = $('<div class="ch-chat-bubble ch-chat-bubble-assistant"></div>');
    $bubble.append('<div class="small text-ch-muted mb-1">Cultura AI</div>');
    var $body = $('<div class="mb-2"></div>');
    if (options.html) {
      $body.html(options.html);
    } else {
      $body.append($("<p/>", { class: "mb-0", text: options.text || "" }));
    }
    $bubble.append($body);
    if (options.actions) {
      var $actions = $('<div class="d-flex flex-wrap gap-2" role="group" aria-label="Message actions"></div>');
      ["Save", "Export", "Create Persona", "Create Report"].forEach(function (label) {
        $actions.append(
          $('<button type="button" class="btn btn-sm btn-outline-primary"></button>').text(label)
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
        showToast("Send is a UI prototype only (no model).", "secondary");
        return;
      }

      var msg = ($ta.val() || "").trim();
      if (!msg || msg.length > 2000) return;

      appendChatUserBubble($scroll, msg);

      var isFirst = !$page.hasClass("ch-chat-page--active");
      if (isFirst) {
        $page.addClass("ch-chat-page--active");
        $threadSection.attr("aria-hidden", "false");
        var raw = getPrototypeMarkdownSource();
        var html = "";
        if (raw && typeof marked !== "undefined") {
          html = marked.parse(raw);
        } else if (raw) {
          html = "<pre class=\"mb-0\">" + String(raw).replace(/</g, "&lt;") + "</pre>";
        } else {
          html = "<p class=\"mb-0 text-ch-secondary\">Sample reply is not available in this build.</p>";
        }
        appendChatAssistantBubble($scroll, { html: html, actions: true });
      } else {
        appendChatAssistantBubble($scroll, {
          text: "Thanks for the follow-up—assistant replies are still a UI prototype (no live model yet).",
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
      var $ta = $("#chat-input");
      if ($ta.length) {
        $ta.val(text).trigger("input");
        $ta[0].focus();
      }
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

      if ($ta.length) {
        $ta.val("").trigger("input");
        $ta.trigger("focus");
      }
      showToast("Started a new chat (prototype).", "primary");
    });

    $("#chHistorySearch").on("input", function () {
      var q = ($(this).val() || "").trim().toLowerCase();
      $("#chHistoryThreadList .ch-history-thread").each(function () {
        var t = ($(this).attr("data-ch-thread-title") || "").toLowerCase();
        $(this).toggleClass("d-none", q.length > 0 && t.indexOf(q) === -1);
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
      if ($ta.length) {
        $ta.val(text).trigger("input");
        $ta[0].focus();
      }
      var el = document.getElementById("chPromptPickerModal");
      if (el && typeof bootstrap !== "undefined") {
        bootstrap.Modal.getInstance(el).hide();
      }
    });
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
      showToast("Language preference saved for future copy (English only in this build).", "secondary");
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
        showToast("Cultural Blueprint destination is not confirmed for this prototype.", "secondary");
      }
    });
  }

  function initProcessedCsvPage() {
    if (getCurrentPage() !== "processed-csvs") return;

    var rows = [
      {
        file: "retail-footfall-q1.csv",
        uploaded: "2025-04-02 09:12",
        processed: "2025-04-02 09:18",
        status: "Ready",
      },
      {
        file: "audience-weights-march.csv",
        uploaded: "2025-04-10 14:40",
        processed: "—",
        status: "Processing",
      },
      {
        file: "sneaker-cohort-sample.csv",
        uploaded: "2025-04-11 11:05",
        processed: "2025-04-11 11:06",
        status: "Failed",
      },
      {
        file: "geo-baseline.csv",
        uploaded: "2025-03-28 08:00",
        processed: "2025-03-28 08:02",
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
        var statusClass =
          r.status === "Ready"
            ? "text-success"
            : r.status === "Failed"
              ? "text-danger"
              : "text-warning";
        $tb.append(
          "<tr>" +
            "<td class=\"fw-medium\">" +
            String(r.file).replace(/</g, "&lt;") +
            "</td>" +
            "<td>" +
            r.uploaded +
            "</td>" +
            "<td>" +
            r.processed +
            "</td>" +
            "<td><span class=\"" +
            statusClass +
            "\">" +
            r.status +
            "</span></td>" +
            "<td>" +
            "<div class=\"btn-group btn-group-sm\">" +
            "<button type=\"button\" class=\"btn btn-outline-secondary\">Download</button>" +
            "<button type=\"button\" class=\"btn btn-outline-secondary\">View</button>" +
            "</div></td>" +
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

  $(function () {
    highlightNav();
    initNavGroups();
    initSidebarCollapse();
    initToastDemo();
    initAiGeneratingDemo();
    initDropzoneDemo();
    initMarkedChat();
    initAuthGate();
    initLogout();
    initAudienceGate();
    initChatComposer();
    initStarterPrompts();
    initChatHistoryDrawer();
    initPromptBrowser();
    initLocaleSelect();
    initHelpModal();
    initDevNav();
    initBlueprintPlaceholder();
    initProcessedCsvPage();
  });
})(window.jQuery);
