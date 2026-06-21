/**
 * CRS Certification Badge — SVG-first premium trust mark.
 * Three core layouts: primary, compact, seal (micro).
 * Colors map to Culture Hive theme tokens (--ch-blue-*, --ch-semantic-*).
 */

/** @typedef {'verified' | 'high' | 'elite'} CRSTier */
/** @typedef {'primary' | 'compact' | 'seal'} CRSLayout */
/** @typedef {'light' | 'dark' | 'mono'} CRSTheme */
/** @typedef {'sm' | 'md' | 'lg' | 'xl'} CRSSize */

export const CRS_TIER_LABELS = {
  verified: "CRS Verified",
  high: "High CRS Score",
  elite: "Elite CRS Score",
};

export const CRS_TIER_HEADLINE = {
  verified: "CRS VERIFIED",
  high: "HIGH CRS SCORE",
  elite: "ELITE CRS SCORE",
};

export const CRS_TIER_SLUG = {
  verified: "crs-verified",
  high: "high-crs-score",
  elite: "elite-crs-score",
};

const VERIFIER = "Verified by Culture Hive";
const FONT = "General Sans, ui-sans-serif, system-ui, sans-serif";

/** Minimum primary width (fallback before text measurement). */
const PRIMARY_MIN_W = 280;

/**
 * Nested border-radius: outer = padding + inner (https://borderradiuscalculator.vercel.app/)
 * @param {number} padding
 * @param {number} [innerRx]
 */
function nestedOuterRadius(padding, innerRx = 0) {
  return Math.max(Math.round(padding + innerRx), 0);
}

/** Approximate rendered width for SVG text (General Sans). */
function estimateTextWidth(text, fontSize, letterSpacingEm = 0, { bold = false } = {}) {
  if (!text) return 0;
  const chars = text.length;
  const factor = bold ? 0.65 : 0.58;
  const base = chars * fontSize * factor;
  const tracking = fontSize * letterSpacingEm * Math.max(chars - 1, 0);
  return base + tracking;
}

/**
 * Primary badge layout — width grows with copy like a responsive button.
 * Verified (verifier-led) keeps tighter right pad; High/Elite (headline-led) get extra optical room.
 * @param {number} h
 * @param {string} headline
 * @param {string} subline
 */
function computePrimaryLayout(h, headline, subline) {
  const padL = h * 0.18;
  const sealGap = h * 0.14;
  const dividerGap = h * 0.12;
  const monoD = h - padL * 1.35;
  const monoCx = padL + monoD / 2;
  const monoCy = h / 2;
  const dividerX = padL + monoD + sealGap;
  const textX = dividerX + dividerGap;
  const headlineSize = h * 0.172;
  const subSize = h * 0.112;
  const headlineTracking = 0.055;

  const headlineWidth = estimateTextWidth(headline, headlineSize, headlineTracking, { bold: true });
  const sublineWidth = estimateTextWidth(subline, subSize, 0, { bold: false });
  const headlineLed = headlineWidth >= sublineWidth;
  const textBlockWidth = Math.max(headlineWidth, sublineWidth) + (headlineLed ? 6 : 2);

  // Verifier-led badges (CRS Verified) already look balanced; headline-led tiers need more air on the right.
  const padR = headlineLed ? padL * 1.5 : padL;
  const w = Math.ceil(textX + textBlockWidth + padR);
  const shellRx = nestedOuterRadius(padL, 0);

  return {
    w: Math.max(w, PRIMARY_MIN_W),
    h,
    monoD,
    monoCx,
    monoCy,
    dividerX,
    textX,
    headlineSize,
    subSize,
    shellRx,
  };
}

/**
 * Tier accents — aligned to theme.css semantic + blue scales.
 * accent = seal stroke/text; ring = seal outer ring; shellFill = pre-mixed tint fill.
 */
const TIER_ACCENTS = {
  verified: {
    accent: "#1f69da",
    accentSoft: "#eff4fa",
    ring: "#bdd1ef",
    shellFill: "#f7fafd",
  },
  high: {
    accent: "#0d4a3c",
    accentSoft: "#e4f3ef",
    ring: "#b5e0d2",
    shellFill: "#f4faf8",
  },
  elite: {
    accent: "#8a4a12",
    accentSoft: "#fff4e8",
    ring: "#f5d4a8",
    shellFill: "#fffcf7",
  },
};

const TIER_ACCENTS_DARK = {
  verified: {
    accent: "#568de1",
    accentSoft: "#182436",
    ring: "#243650",
    shellFill: "#182436",
  },
  high: {
    accent: "#5cb896",
    accentSoft: "#142420",
    ring: "#1f4038",
    shellFill: "#142420",
  },
  elite: {
    accent: "#c9a24d",
    accentSoft: "#221e14",
    ring: "#4a3e24",
    shellFill: "#221e14",
  },
};

const THEMES = {
  light: {
    surface: "#ffffff",
    text: "#0a1628",
    muted: "#5d677a",
    border: "#d3e8f0",
    divider: "#dde2ea",
  },
  dark: {
    surface: "#151d2b",
    text: "#f6f7f9",
    muted: "#a4afc0",
    border: "#3d4656",
    divider: "#2a3140",
  },
  mono: {
    surface: "#ffffff",
    text: "#0a1628",
    muted: "#434b5c",
    border: "#0a1628",
    divider: "#c7cfdb",
  },
};

const SIZE_SCALE = { sm: 0.68, md: 1, lg: 1.32, xl: 1.72 };

const LAYOUT_BASES = {
  primary: { w: PRIMARY_MIN_W, h: 104 },
  compact: { w: 272, h: 56 },
  seal: { w: 56, h: 56 },
};

/**
 * @param {object} opts
 */
export function getBadgeColors({ tier = "elite", theme = "light" }) {
  const base = THEMES[theme] || THEMES.light;

  if (theme === "mono") {
    return {
      ...base,
      accent: base.text,
      accentSoft: "#f6f7f9",
      ring: base.border,
      shellFill: base.surface,
    };
  }

  const tierColors =
    theme === "dark"
      ? TIER_ACCENTS_DARK[tier] || TIER_ACCENTS_DARK.elite
      : TIER_ACCENTS[tier] || TIER_ACCENTS.elite;

  return { ...base, ...tierColors };
}

/**
 * @param {object} opts
 */
export function getBadgeDimensions({ layout = "primary", size = "md", tier, headline, subline } = {}) {
  const scale = SIZE_SCALE[size] || 1;
  const base = LAYOUT_BASES[layout] || LAYOUT_BASES.primary;

  if (layout === "primary") {
    const scaledH = Math.round(base.h * scale);
    const tierHeadline = headline || CRS_TIER_HEADLINE[tier] || CRS_TIER_HEADLINE.elite;
    const verifier = subline !== undefined ? subline : VERIFIER;
    const metrics = computePrimaryLayout(scaledH, tierHeadline, verifier);
    return { width: metrics.w, height: scaledH, scale };
  }

  return {
    width: Math.round(base.w * scale),
    height: Math.round(base.h * scale),
    scale,
  };
}

/**
 * @param {object} opts
 */
export function getBadgeCopy({
  tier = "elite",
  layout = "primary",
  showVerifier = true,
  publisherName,
  verifiedDate,
}) {
  const tierLabel = CRS_TIER_LABELS[tier] || CRS_TIER_LABELS.elite;
  const tierHeadline = CRS_TIER_HEADLINE[tier] || CRS_TIER_HEADLINE.elite;

  const headline = layout === "seal" ? tierLabel : tierHeadline;
  const subline = showVerifier && layout !== "seal" ? VERIFIER : "";

  return { headline, subline, tierLabel, publisherName, verifiedDate };
}

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** CRS monogram seal — circular certification mark */
function crsMonogram(cx, cy, d, colors, { mono = false, compact = false } = {}) {
  const r = d / 2;
  const stroke = mono ? colors.text : colors.accent;
  const ring = mono ? colors.border : colors.ring || colors.border;
  const fill = mono ? colors.surface : colors.accentSoft;
  const crsSize = compact ? r * 0.66 : r * 0.62;
  const checkScale = compact ? 0.16 : 0.14;
  const ringWidth = compact ? 1.5 : 2;

  return `
    <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="${fill}" stroke="${ring}" stroke-width="${ringWidth}"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="none" stroke="${stroke}" stroke-width="${mono ? 1.5 : 1.25}" opacity="${mono ? 1 : 0.45}"/>
    <text x="${cx}" y="${cy - (compact ? r * 0.05 : r * 0.07)}" text-anchor="middle" dominant-baseline="middle"
      fill="${stroke}" font-family="${FONT}" font-size="${crsSize}" font-weight="700" letter-spacing="-0.04em">CRS</text>
    <path d="M ${cx - r * checkScale} ${cy + r * 0.28} L ${cx - r * checkScale * 0.2} ${cy + r * (0.28 + checkScale * 0.9)} L ${cx + r * checkScale} ${cy + r * (0.28 - checkScale * 0.5)}"
      fill="none" stroke="${stroke}" stroke-width="${compact ? 1.5 : 1.75}" stroke-linecap="round" stroke-linejoin="round"/>
  `;
}

function badgeShell(w, h, colors, rx, { strokeWidth = 1.5, mono = false } = {}) {
  const inset = 1;
  const innerW = w - inset * 2;
  const innerH = h - inset * 2;
  const fill = mono ? colors.surface : colors.shellFill || colors.surface;

  return `<rect x="${inset}" y="${inset}" width="${innerW}" height="${innerH}" rx="${rx}" fill="${fill}" stroke="${colors.border}" stroke-width="${strokeWidth}"/>`;
}

function verticalDivider(x, cy, h, colors, heightRatio = 0.4) {
  const half = (h * heightRatio) / 2;
  const stroke = colors.ring || colors.divider;
  return `<line x1="${x}" y1="${cy - half}" x2="${x}" y2="${cy + half}" stroke="${stroke}" stroke-width="1.25" opacity="0.45"/>`;
}

function textBlock(textX, cy, headline, subline, colors, { headlineSize, subSize, compact = false }) {
  const tracking = compact ? "0.045em" : "0.055em";

  if (!subline) {
    return `
    <text x="${textX}" y="${cy}" fill="${colors.text}"
      font-family="${FONT}" font-size="${headlineSize}" font-weight="700"
      letter-spacing="${tracking}" dominant-baseline="middle">${esc(headline)}</text>`;
  }

  const lineGap = headlineSize * 0.2;
  const headlineY = cy - (subSize + lineGap) / 2;
  const subY = cy + (headlineSize + lineGap) / 2;

  return `
    <text x="${textX}" y="${headlineY}" fill="${colors.text}"
      font-family="${FONT}" font-size="${headlineSize}" font-weight="700"
      letter-spacing="${tracking}" dominant-baseline="middle">${esc(headline)}</text>
    <text x="${textX}" y="${subY}" fill="${colors.muted}"
      font-family="${FONT}" font-size="${subSize}" font-weight="500"
      dominant-baseline="middle">${esc(subline)}</text>
  `;
}

function buildPrimarySvg({ w, h, colors, copy, mono, layoutMetrics }) {
  const m = layoutMetrics || computePrimaryLayout(h, copy.headline, copy.subline);
  const width = m.w;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${h}" width="${width}" height="${h}" role="img" aria-label="${esc(copy.tierLabel + ", " + VERIFIER)}">
  <title>${esc(copy.tierLabel)} — ${esc(VERIFIER)}</title>
  ${badgeShell(width, h, colors, m.shellRx, { strokeWidth: 1.5, mono })}
  ${crsMonogram(m.monoCx, m.monoCy, m.monoD, colors, { mono })}
  ${verticalDivider(m.dividerX, m.monoCy, h, colors, 0.38)}
  ${textBlock(m.textX, m.monoCy, copy.headline, copy.subline, colors, {
    headlineSize: m.headlineSize,
    subSize: m.subSize,
  })}
</svg>`.trim();
}

function buildCompactSvg({ w, h, colors, copy, mono }) {
  const padL = h * 0.15;
  const sealGap = h * 0.11;
  const dividerGap = h * 0.09;
  const monoD = h - padL * 1.2;
  const monoCx = padL + monoD / 2;
  const monoCy = h / 2;
  const dividerX = padL + monoD + sealGap;
  const textX = dividerX + dividerGap;
  const headlineSize = h * 0.26;
  const subSize = h * 0.205;
  const rx = h / 2;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(copy.tierLabel + (copy.subline ? ", " + copy.subline : ""))}">
  <title>${esc(copy.tierLabel)}${copy.subline ? ` — ${esc(copy.subline)}` : ""}</title>
  ${badgeShell(w, h, colors, rx, { strokeWidth: 1.25, mono })}
  ${crsMonogram(monoCx, monoCy, monoD, colors, { mono, compact: true })}
  ${verticalDivider(dividerX, monoCy, h, colors, 0.34)}
  ${textBlock(textX, monoCy, copy.headline, copy.subline, colors, {
    headlineSize,
    subSize,
    compact: true,
  })}
</svg>`.trim();
}

function buildSealSvg({ w, h, colors, copy, mono }) {
  const pad = h * 0.04;
  const monoD = h - pad * 2;
  const monoCx = w / 2;
  const monoCy = h / 2;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(copy.tierLabel + ", " + VERIFIER)}">
  <title>${esc(copy.tierLabel)} — ${esc(VERIFIER)}</title>
  ${crsMonogram(monoCx, monoCy, monoD, colors, { mono, compact: true })}
</svg>`.trim();
}

/**
 * @param {object} opts
 * @returns {string} SVG markup
 */
export function renderBadgeSvg(opts = {}) {
  const {
    tier = "elite",
    layout = "primary",
    theme = "light",
    size = "md",
    showVerifier = true,
    publisherName,
    verifiedDate,
  } = opts;

  const resolvedLayout = layout === "horizontal" ? "compact" : layout;
  const colors = getBadgeColors({ tier, theme });
  const copy = getBadgeCopy({
    tier,
    layout: resolvedLayout,
    showVerifier,
    publisherName,
    verifiedDate,
  });
  const mono = theme === "mono";
  const { width, height } = getBadgeDimensions({
    layout: resolvedLayout,
    size,
    tier,
    headline: copy.headline,
    subline: copy.subline,
  });

  const layoutMetrics =
    resolvedLayout === "primary"
      ? computePrimaryLayout(height, copy.headline, copy.subline)
      : null;

  const dims = { w: width, h: height, colors, copy, mono, layoutMetrics };

  if (resolvedLayout === "compact") return buildCompactSvg(dims);
  if (resolvedLayout === "seal") return buildSealSvg(dims);
  return buildPrimarySvg(dims);
}

/**
 * @param {object} opts
 * @returns {string} HTML wrapper with inline SVG
 */
export function renderBadgeHtml(opts = {}) {
  const {
    tier = "elite",
    layout = "primary",
    theme = "light",
    size = "md",
    showVerifier = true,
    publisherName,
    verifiedDate,
    className = "",
    linkHref,
  } = opts;

  const resolvedLayout = layout === "horizontal" ? "compact" : layout;
  const svg = renderBadgeSvg({
    tier,
    layout: resolvedLayout,
    theme,
    size,
    showVerifier,
    publisherName,
    verifiedDate,
  });
  const classes = [
    "ch-crs-cert-badge",
    `ch-crs-cert-badge--${resolvedLayout}`,
    `ch-crs-cert-badge--${theme}`,
    `ch-crs-cert-badge--${tier}`,
    `ch-crs-cert-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = `<span class="ch-crs-cert-badge__svg" aria-hidden="false">${svg}</span>`;

  if (linkHref) {
    return `<a class="${classes} ch-crs-cert-badge--linked" href="${esc(linkHref)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
  }
  return `<span class="${classes}" role="img">${inner}</span>`;
}

/**
 * @param {object} opts
 * @returns {string}
 */
export function getExportFilename(opts = {}) {
  const { tier = "elite", theme = "light", layout = "primary", format = "svg" } = opts;
  const slug = CRS_TIER_SLUG[tier] || CRS_TIER_SLUG.elite;
  const themeSuffix = theme === "light" ? "" : `-${theme}`;
  const layoutSuffix = layout === "primary" ? "" : `-${layout === "horizontal" ? "compact" : layout}`;
  return `culture-hive-${slug}-badge${layoutSuffix}${themeSuffix}.${format}`;
}

/**
 * @param {string} svgString
 * @param {number} targetWidth
 * @param {object} [opts]
 * @param {string} [opts.background] solid bg or "transparent"
 * @returns {Promise<Blob>}
 */
export function svgToPngBlob(svgString, targetWidth, opts = {}) {
  const { background = "transparent" } = opts;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.documentElement;
  const viewBox = svgEl.getAttribute("viewBox")?.split(/\s+/).map(Number) || [0, 0, 280, 104];
  const aspect = viewBox[3] / viewBox[2];
  const width = targetWidth;
  const height = Math.round(targetWidth * aspect);

  svgEl.setAttribute("width", String(width));
  svgEl.setAttribute("height", String(height));
  const serialized = new XMLSerializer().serializeToString(svgEl);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      if (background && background !== "transparent") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNG export failed"));
      }, "image/png");
    };
    img.onerror = () => reject(new Error("SVG render failed"));
    img.src = url;
  });
}

/** @param {Blob} blob @param {string} filename */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** @param {string} svg @param {string} filename */
export function downloadSvg(svg, filename) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}

export const PNG_PRESETS = [
  { id: "web-sm", label: "Small web (320px)", width: 320 },
  { id: "web-retina", label: "Retina web (640px)", width: 640 },
  { id: "presentation", label: "Presentation (1200px)", width: 1200 },
  { id: "print", label: "Print large (2400px)", width: 2400 },
];

export const CRS_BADGE_LAYOUTS = ["primary", "compact", "seal"];
export const CRS_BADGE_THEMES = ["light", "dark", "mono"];

export const CRS_BADGE_TOOLTIP =
  "This property has achieved an Elite CRS Score, indicating strong cultural relevance for a defined audience segment based on Culture Hive's proprietary CRS methodology.";
