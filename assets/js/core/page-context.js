import { $ } from "./dom-utils.js";
import { STORAGE_KEYS } from "./constants.js";

export function getCurrentPage() {
  return (document.body.getAttribute("data-ch-current") || "").trim();
}

export function getPagePrefix() {
  const folder = (document.body.getAttribute("data-ch-folder") || "").trim();
  if (folder === "analyses") return "../";
  const path = window.location.pathname || "";
  if (path.indexOf("/processed-csvs/") !== -1 || path.indexOf("/chat/") !== -1) return "../";
  return "";
}

export function getDataMode() {
  try {
    return localStorage.getItem(STORAGE_KEYS.dataMode) === "new" ? "new" : "established";
  } catch (e) {
    return "established";
  }
}

export function isNewAccountMode() {
  return getDataMode() === "new";
}

export function setDataMode(mode) {
  const next = mode === "new" ? "new" : "established";
  try {
    localStorage.setItem(STORAGE_KEYS.dataMode, next);
  } catch (e) {
    /* ignore */
  }
  document.documentElement.classList.toggle("ch-data-mode-new", next === "new");
  document.documentElement.classList.toggle("ch-data-mode-established", next !== "new");
}

export function applyDataModeUi() {
  const isNew = isNewAccountMode();
  $(".ch-command-palette-list a").each(function () {
    const href = ($(this).attr("href") || "").toLowerCase();
    $(this).toggleClass("d-none", isNew && href.indexOf("espn-detail") !== -1);
  });
}

import { showToast } from "./toast.js";

export function initDataModeSettings() {
  const $toggle = $("#chDataModeSample");
  if (!$toggle.length) return;

  $toggle.prop("checked", !isNewAccountMode());
  $toggle.on("change", function () {
    const established = $(this).prop("checked");
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
