#!/usr/bin/env node
/** Strip duplicate definitions already provided by core modules. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "../assets/js/workspace/index.js");
let src = fs.readFileSync(file, "utf8");

// Remove duplicate const/var blocks and functions moved to core modules
const patterns = [
  /^\s*"use strict";\s*\n/m,
  /^\s*var STORAGE_SIDEBAR[\s\S]*?var AI_DOCK_EXPANDED_OFFSET = "14rem";\s*\n/m,
  /^\s*var CH_COPY = \{[\s\S]*?\};\s*\n/m,
  /^\s*function getDataMode\(\) \{[\s\S]*?\}\s*\n/m,
  /^\s*function isNewAccountMode\(\) \{[\s\S]*?\}\s*\n/m,
  /^\s*function setDataMode\(mode\) \{[\s\S]*?\}\s*\n/m,
  /^\s*function applyDataModeUi\(\) \{[\s\S]*?\}\s*\n/m,
  /^\s*function initDataModeSettings\(\) \{[\s\S]*?\}\s*\n/m,
  /^\s*function showToast\(message[\s\S]*?\}\s*\n/m,
  /^\s*function initToastDemo\(\) \{[\s\S]*?\}\s*\n/m,
  /^\s*function getCurrentPage\(\) \{[\s\S]*?\}\s*\n/m,
  /^\s*function getPagePrefix\(\) \{[\s\S]*?\}\s*\n/m,
];

for (const re of patterns) {
  src = src.replace(re, "");
}

// Add imports for initDataModeSettings and initToastDemo
src = src.replace(
  'import {\n  getCurrentPage,\n  getPagePrefix,\n  getDataMode,\n  isNewAccountMode,\n  setDataMode,\n  applyDataModeUi,\n} from "../core/page-context.js";',
  'import {\n  getCurrentPage,\n  getPagePrefix,\n  getDataMode,\n  isNewAccountMode,\n  setDataMode,\n  applyDataModeUi,\n  initDataModeSettings,\n} from "../core/page-context.js";\nimport { initToastDemo } from "../core/toast.js";'
);

fs.writeFileSync(file, src);
console.log("Cleaned workspace/index.js");
