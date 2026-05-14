/**
 * Cultura prototype: thin jQuery + Bootstrap 5 helpers.
 */
(function ($) {
  "use strict";

  var STORAGE_SIDEBAR = "ch-sidebar-collapsed";

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

  /** Open the sidebar <details> group that contains the active route (prototype: static HTML + data-ch-current). */
  function initNavGroups() {
    $(".ch-nav-group").each(function () {
      var $g = $(this);
      var open = $g.find(".ch-nav-link.ch-nav-active, .ch-nav-link.active").length > 0;
      $g.prop("open", open);
    });
  }

  function initSidebarCollapse() {
    var $toggle = $("#chSidebarCollapse");
    if (!$toggle.length) return;

    function apply(collapsed) {
      $("body").toggleClass("ch-sidebar-collapsed", collapsed);
      $toggle.attr("aria-pressed", collapsed ? "true" : "false");
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

    $toggle.on("click", function () {
      apply(!$("body").hasClass("ch-sidebar-collapsed"));
    });
  }

  function initToastDemo() {
    $(document).on("click", "[data-ch-demo-toast]", function (e) {
      e.preventDefault();
      var $host = $("#chToastHost");
      if (!$host.length) return;

      var id = "chToast-" + Date.now();
      var html =
        '<div id="' +
        id +
        '" class="toast align-items-center text-bg-primary border-0" role="status" aria-live="polite" aria-atomic="true">' +
        '<div class="d-flex">' +
        '<div class="toast-body">Saved successfully. This is a demo toast.</div>' +
        '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Dismiss notification"></button>' +
        "</div></div>";

      $host.append(html);
      var el = document.getElementById(id);
      if (!el || typeof bootstrap === "undefined") return;
      var toast = new bootstrap.Toast(el, { delay: 4500 });
      el.addEventListener(
        "hidden.bs.toast",
        function () {
          $(el).remove();
        },
        { once: true }
      );
      toast.show();
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

    /* Prototype only: trusted static markdown from the page. */
    $target.html(marked.parse(String(raw).trim()));
  }

  $(function () {
    highlightNav();
    initNavGroups();
    initSidebarCollapse();
    initToastDemo();
    initAiGeneratingDemo();
    initDropzoneDemo();
    initMarkedChat();
  });
})(window.jQuery);
