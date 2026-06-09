#!/usr/bin/env node
/**
 * Rebuild assets/js/ch-icon-sprite-inject.js from assets/icons/streamline-sprite.svg
 * so local file:// pages get inline symbols (<use href="#id">).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const svgPath = path.join(ROOT, "assets/icons/streamline-sprite.svg");
const outPath = path.join(ROOT, "assets/js/ch-icon-sprite-inject.js");

const svg = fs.readFileSync(svgPath, "utf8");
const inner = svg
  .replace(/<\?xml[^?]*\?>\s*/i, "")
  .replace(/<!--[\s\S]*?-->\s*/g, "")
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .trim();

const payload = JSON.stringify(inner);
const js =
  "// Injected so <use href=\"#id\"> works when opening HTML via file:// (Chrome blocks external .svg# fragment refs).\n" +
  "// Regenerate: node scripts/sync-ch-icon-sprite-inject.mjs\n" +
  "(function () {\n" +
  '  if (document.getElementById("ch-streamline-sprite-root")) return;\n' +
  '  var wrap = document.createElement("div");\n' +
  "  wrap.innerHTML =\n" +
  '    \'<svg xmlns="http://www.w3.org/2000/svg" id="ch-streamline-sprite-root" width="0" height="0" style="position:absolute;overflow:hidden;clip:rect(0,0,0,0)" aria-hidden="true">\' +\n' +
  "    " +
  payload +
  " +\n" +
  "    '</svg>';\n" +
  "  var mount = document.body || document.documentElement;\n" +
  "  mount.insertBefore(wrap.firstElementChild, mount.firstChild);\n" +
  "})();\n";

fs.writeFileSync(outPath, js);
console.log("Wrote", path.relative(ROOT, outPath));
