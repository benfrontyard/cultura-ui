import { $, escapeHtml } from "./dom-utils.js";
import { CH_COPY } from "./constants.js";

/** @param {string} message @param {string} [variant] @param {object} [options] */
export function showToast(message, variant, options) {
  variant = variant || "primary";
  options = options || {};
  const $host = $("#chToastHost");
  if (!$host.length || typeof bootstrap === "undefined") return;

  const id = "chToast-" + Date.now();
  let actionHtml = "";
  if (options.actionLabel) {
    actionHtml =
      '<button type="button" class="btn btn-sm btn-light fw-semibold me-2 my-auto" data-ch-toast-action>' +
      escapeHtml(String(options.actionLabel)) +
      "</button>";
  }
  const html =
    '<div id="' +
    id +
    '" class="toast align-items-center text-bg-' +
    variant +
    ' border-0" role="status" aria-live="polite" aria-atomic="true">' +
    '<div class="d-flex">' +
    '<div class="toast-body">' +
    escapeHtml(String(message)) +
    "</div>" +
    actionHtml +
    '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Dismiss notification"></button>' +
    "</div></div>";

  $host.append(html);
  const el = document.getElementById(id);
  if (!el) return;
  const toast = new bootstrap.Toast(el, { delay: options.delay || 4500 });
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
      el.remove();
    },
    { once: true }
  );
  toast.show();
}

export function initToastDemo() {
  $(document).on("click", "[data-ch-demo-toast]", function (e) {
    e.preventDefault();
    const msg = $(this).attr("data-ch-toast-message") || CH_COPY.toastDefault;
    const variant = $(this).attr("data-ch-toast-variant") || "secondary";
    showToast(msg, variant);
  });
}
