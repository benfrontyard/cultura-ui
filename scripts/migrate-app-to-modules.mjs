#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(root, "assets/js/app.legacy.js"), "utf8");

const iifeBody = src
  .replace(/^[\s\S]*?\(function \(\$\) \{\s*"use strict";\s*/, "")
  .replace(/\s*\$\(function \(\) \{[\s\S]*?\}\);\s*\}\)\(window\.jQuery\);\s*$/, "")
  .trim();

const header = `/**
 * Workspace behavior migrated from assets/js/app.legacy.js
 */
import { $, domReady, extend, fetchJson } from "../core/dom-utils.js";
import {
  highlightNav as layoutHighlightNav,
  initNavGroups as layoutInitNavGroups,
  initSidebarCollapse as layoutInitSidebarCollapse,
  initTopbarHistoryNav as layoutInitTopbarHistoryNav,
  initNavDestinations as layoutInitNavDestinations,
} from "../layout/navigation.js";

$.extend = extend;
$.getJSON = function getJSON(url) {
  const jqXHR = fetchJson(url);
  jqXHR.fail = function (fn) {
    jqXHR.catch(fn);
    return jqXHR;
  };
  return jqXHR;
};
$.Deferred = function Deferred() {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  promise.resolve = (v) => { resolve(v); return promise; };
  return { resolve, promise: () => promise };
};

`;

const footer = `
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
`;

fs.writeFileSync(path.join(root, "assets/js/workspace/index.js"), header + iifeBody + footer);
console.log("Wrote clean workspace/index.js");
