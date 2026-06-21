/**
 * CRS Certification Badge — SVG-first premium trust mark.
 * Hexagon CRS seal + Culture Hive brand blue identity.
 * Three layouts (primary, compact, seal) × three style directions (classic, accent, sealHero).
 */

/** @typedef {'verified' | 'high' | 'elite'} CRSTier */
/** @typedef {'primary' | 'compact' | 'seal'} CRSLayout */
/** @typedef {'classic' | 'accent' | 'sealHero'} CRSStyle */
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

export const CRS_BADGE_STYLES = /** @type {const} */ (["classic", "accent", "sealHero"]);

export const CRS_BADGE_STYLE_LABELS = {
  classic: "Direction 1 — Classic certification",
  accent: "Direction 2 — Branded accent",
  sealHero: "Direction 3 — Seal-first",
};

const VERIFIER = "Verified by Culture Hive";
const FONT = "General Sans, ui-sans-serif, system-ui, sans-serif";

/** Brand blue family — core identity color for all tiers. */
const BRAND = {
  accent: "#1f69da",
  accentSoft: "#eff4fa",
  ring: "#bdd1ef",
  shellFill: "#ffffff",
  shellBorder: "#d3e8f0",
};

const PRIMARY_MIN_W = 268;
const COMPACT_MIN_W = 220;
const COMPACT_MAX_W = 320;

/**
 * Nested border-radius: outer = padding + inner.
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
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {number} [rotationDeg]
 */
function hexPath(cx, cy, r, rotationDeg = -90) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = ((rotationDeg + 60 * i) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

/**
 * Tier accents — unified Culture Hive brand blue for all tiers.
 * Tier is communicated through copy (headline), not color.
 */
const TIER_ACCENTS = {
  verified: {
    accent: BRAND.accent,
    accentSoft: BRAND.accentSoft,
    ring: BRAND.ring,
    shellFill: BRAND.shellFill,
    shellBorder: BRAND.shellBorder,
    shellAccent: BRAND.accent,
  },
  high: {
    accent: BRAND.accent,
    accentSoft: BRAND.accentSoft,
    ring: BRAND.ring,
    shellFill: BRAND.shellFill,
    shellBorder: BRAND.shellBorder,
    shellAccent: BRAND.accent,
  },
  elite: {
    accent: BRAND.accent,
    accentSoft: BRAND.accentSoft,
    ring: BRAND.ring,
    shellFill: BRAND.shellFill,
    shellBorder: BRAND.shellBorder,
    shellAccent: BRAND.accent,
  },
};

const TIER_ACCENTS_DARK = {
  verified: {
    accent: "#568de1",
    accentSoft: "#182436",
    ring: "#243650",
    shellFill: "#151d2b",
    shellBorder: "#3d4656",
    shellAccent: "#568de1",
  },
  high: {
    accent: "#568de1",
    accentSoft: "#182436",
    ring: "#243650",
    shellFill: "#151d2b",
    shellBorder: "#3d4656",
    shellAccent: "#568de1",
  },
  elite: {
    accent: "#568de1",
    accentSoft: "#182436",
    ring: "#243650",
    shellFill: "#151d2b",
    shellBorder: "#3d4656",
    shellAccent: "#568de1",
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
  compact: { w: COMPACT_MIN_W, h: 56 },
  seal: { w: 56, h: 56 },
};

/** Style-specific layout tuning. */
const STYLE_METRICS = {
  classic: { sealScale: 1, padScale: 1, shellAccentBar: false, shellTint: false },
  accent: { sealScale: 1, padScale: 0.96, shellAccentBar: true, shellTint: true },
  sealHero: { sealScale: 1.14, padScale: 1.04, shellAccentBar: false, shellTint: false },
};

/**
 * Shared horizontal badge layout — primary and compact both use this.
 * @param {number} h
 * @param {string} headline
 * @param {string} subline
 * @param {object} opts
 * @param {boolean} [opts.compact]
 * @param {CRSStyle} [opts.style]
 */
function computeHorizontalLayout(h, headline, subline, { compact = false, style = "classic" } = {}) {
  const sm = STYLE_METRICS[style] || STYLE_METRICS.classic;
  const padBase = compact ? 0.16 : 0.17;
  const padL = h * padBase * sm.padScale;
  const sealGap = h * (compact ? 0.13 : 0.15);
  const dividerGap = h * (compact ? 0.11 : 0.13);
  const sealD = (h - padL * (compact ? 1.1 : 1.25)) * sm.sealScale;
  const sealCx = padL + sealD / 2;
  const sealCy = h / 2;
  const dividerX = padL + sealD + sealGap;
  const textX = dividerX + dividerGap;
  const headlineSize = h * (compact ? 0.255 : 0.168);
  const subSize = h * (compact ? 0.198 : 0.108);
  const headlineTracking = compact ? 0.04 : 0.052;

  const headlineWidth = estimateTextWidth(headline, headlineSize, headlineTracking, { bold: true });
  const sublineWidth = subline ? estimateTextWidth(subline, subSize, 0, { bold: false }) : 0;
  const textBlockWidth = Math.max(headlineWidth, sublineWidth) + 4;
  const padR = padL * (compact ? 1.15 : 1.35);
  const minW = compact ? COMPACT_MIN_W : PRIMARY_MIN_W;
  const maxW = compact ? COMPACT_MAX_W : Infinity;
  const w = Math.min(Math.max(Math.ceil(textX + textBlockWidth + padR), minW), maxW);
  const shellRx = compact ? h / 2 : nestedOuterRadius(padL, 6);

  return {
    w,
    h,
    sealD,
    sealCx,
    sealCy,
    dividerX,
    textX,
    headlineSize,
    subSize,
    shellRx,
    padL,
  };
}

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
      shellBorder: base.border,
      shellAccent: base.text,
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
export function getBadgeDimensions({ layout = "primary", size = "md", tier, headline, subline, style = "classic" } = {}) {
  const scale = SIZE_SCALE[size] || 1;
  const base = LAYOUT_BASES[layout] || LAYOUT_BASES.primary;

  if (layout === "primary" || layout === "compact") {
    const scaledH = Math.round(base.h * scale);
    const tierHeadline = headline || CRS_TIER_HEADLINE[tier] || CRS_TIER_HEADLINE.elite;
    const verifier = subline !== undefined ? subline : VERIFIER;
    const metrics = computeHorizontalLayout(scaledH, tierHeadline, verifier, {
      compact: layout === "compact",
      style,
    });
    return { width: metrics.w, height: scaledH, scale };
  }

  const sealScale = (STYLE_METRICS[style]?.sealScale || 1) * scale;
  return {
    width: Math.round(base.w * sealScale),
    height: Math.round(base.h * sealScale),
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

/**
 * Hexagon CRS seal — Culture Hive certification emblem.
 * @param {number} cx
 * @param {number} cy
 * @param {number} d
 * @param {object} colors
 * @param {object} [opts]
 */
function crsHexSeal(cx, cy, d, colors, { mono = false, compact = false } = {}) {
  const r = d / 2;
  const stroke = mono ? colors.text : colors.accent;
  const ring = mono ? colors.border : colors.ring || colors.border;
  const fill = mono ? colors.surface : colors.accentSoft;
  const crsSize = r * (compact ? 0.52 : 0.48);
  const checkScale = compact ? 0.15 : 0.13;
  const outerW = compact ? 1.5 : 1.75;
  const innerW = compact ? 1 : 1.15;
  const innerInset = compact ? 4.5 : 5.5;

  return `
    <path d="${hexPath(cx, cy, r - 0.5)}" fill="${fill}" stroke="${ring}" stroke-width="${outerW}" stroke-linejoin="round"/>
    <path d="${hexPath(cx, cy, r - innerInset)}" fill="none" stroke="${stroke}" stroke-width="${innerW}" opacity="${mono ? 1 : 0.5}"/>
    <text x="${cx}" y="${cy - (compact ? r * 0.04 : r * 0.06)}" text-anchor="middle" dominant-baseline="middle"
      fill="${stroke}" font-family="${FONT}" font-size="${crsSize}" font-weight="700" letter-spacing="-0.03em">CRS</text>
    <path d="M ${cx - r * checkScale} ${cy + r * 0.26} L ${cx - r * checkScale * 0.15} ${cy + r * (0.26 + checkScale * 0.85)} L ${cx + r * checkScale} ${cy + r * (0.26 - checkScale * 0.45)}"
      fill="none" stroke="${stroke}" stroke-width="${compact ? 1.5 : 1.65}" stroke-linecap="round" stroke-linejoin="round"/>
  `;
}

/**
 * @param {number} w
 * @param {number} h
 * @param {object} colors
 * @param {number} rx
 * @param {object} opts
 */
function badgeShell(w, h, colors, rx, { strokeWidth = 1.5, mono = false, style = "classic" } = {}) {
  const inset = 1;
  const innerW = w - inset * 2;
  const innerH = h - inset * 2;
  const sm = STYLE_METRICS[style] || STYLE_METRICS.classic;
  const fill = mono ? colors.surface : sm.shellTint ? colors.shellFill || colors.surface : colors.surface;
  const border = mono ? colors.border : colors.shellBorder || colors.border;

  let accentBar = "";
  if (!mono && sm.shellAccentBar) {
    const barW = Math.max(3, h * 0.035);
    accentBar = `<rect x="${inset}" y="${inset}" width="${barW}" height="${innerH}" rx="${Math.min(barW / 2, rx)}" fill="${colors.shellAccent || colors.accent}"/>`;
  }

  return `
    <rect x="${inset}" y="${inset}" width="${innerW}" height="${innerH}" rx="${rx}" fill="${fill}" stroke="${border}" stroke-width="${strokeWidth}"/>
    ${accentBar}
  `;
}

function verticalDivider(x, cy, h, colors, heightRatio = 0.4) {
  const half = (h * heightRatio) / 2;
  const stroke = colors.ring || colors.divider;
  return `<line x1="${x}" y1="${cy - half}" x2="${x}" y2="${cy + half}" stroke="${stroke}" stroke-width="1.25" opacity="0.5"/>`;
}

function textBlock(textX, cy, headline, subline, colors, { headlineSize, subSize, compact = false }) {
  const tracking = compact ? "0.04em" : "0.052em";

  if (!subline) {
    return `
    <text x="${textX}" y="${cy}" fill="${colors.text}"
      font-family="${FONT}" font-size="${headlineSize}" font-weight="700"
      letter-spacing="${tracking}" dominant-baseline="middle">${esc(headline)}</text>`;
  }

  const lineGap = headlineSize * 0.28;
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

function buildPrimarySvg({ w, h, colors, copy, mono, layoutMetrics, style = "classic" }) {
  const m = layoutMetrics || computeHorizontalLayout(h, copy.headline, copy.subline, { style });
  const width = m.w;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${h}" width="${width}" height="${h}" role="img" aria-label="${esc(copy.tierLabel + ", " + VERIFIER)}">
  <title>${esc(copy.tierLabel)} — ${esc(VERIFIER)}</title>
  ${badgeShell(width, h, colors, m.shellRx, { strokeWidth: 1.5, mono, style })}
  ${crsHexSeal(m.sealCx, m.sealCy, m.sealD, colors, { mono, style })}
  ${verticalDivider(m.dividerX, m.sealCy, h, colors, 0.36)}
  ${textBlock(m.textX, m.sealCy, copy.headline, copy.subline, colors, {
    headlineSize: m.headlineSize,
    subSize: m.subSize,
  })}
</svg>`.trim();
}

function buildCompactSvg({ w, h, colors, copy, mono, layoutMetrics, style = "classic" }) {
  const m = layoutMetrics || computeHorizontalLayout(h, copy.headline, copy.subline, { compact: true, style });
  const width = m.w;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${h}" width="${width}" height="${h}" role="img" aria-label="${esc(copy.tierLabel + (copy.subline ? ", " + copy.subline : ""))}">
  <title>${esc(copy.tierLabel)}${copy.subline ? ` — ${esc(copy.subline)}` : ""}</title>
  ${badgeShell(width, h, colors, m.shellRx, { strokeWidth: 1.25, mono, style })}
  ${crsHexSeal(m.sealCx, m.sealCy, m.sealD, colors, { mono, compact: true, style })}
  ${verticalDivider(m.dividerX, m.sealCy, h, colors, 0.32)}
  ${textBlock(m.textX, m.sealCy, copy.headline, copy.subline, colors, {
    headlineSize: m.headlineSize,
    subSize: m.subSize,
    compact: true,
  })}
</svg>`.trim();
}

function buildSealSvg({ w, h, colors, copy, mono, style = "classic" }) {
  const sm = STYLE_METRICS[style] || STYLE_METRICS.classic;
  const pad = h * (style === "sealHero" ? 0.02 : 0.05);
  const sealD = (h - pad * 2) * sm.sealScale;
  const sealCx = w / 2;
  const sealCy = h / 2;

  const outerRing =
    style === "accent" && !mono
      ? `<path d="${hexPath(sealCx, sealCy, sealD / 2 + 3)}" fill="none" stroke="${colors.shellAccent || colors.accent}" stroke-width="1" opacity="0.35"/>`
      : "";

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(copy.tierLabel + ", " + VERIFIER)}">
  <title>${esc(copy.tierLabel)} — ${esc(VERIFIER)}</title>
  ${outerRing}
  ${crsHexSeal(sealCx, sealCy, sealD, colors, { mono, compact: true, style })}
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
    style = "classic",
    theme = "light",
    size = "md",
    showVerifier = true,
    publisherName,
    verifiedDate,
  } = opts;

  const colors = getBadgeColors({ tier, theme });
  const copy = getBadgeCopy({
    tier,
    layout,
    showVerifier,
    publisherName,
    verifiedDate,
  });
  const mono = theme === "mono";
  const { width, height } = getBadgeDimensions({
    layout,
    size,
    tier,
    style,
    headline: copy.headline,
    subline: copy.subline,
  });

  const layoutMetrics =
    layout === "primary" || layout === "compact"
      ? computeHorizontalLayout(height, copy.headline, copy.subline, {
          compact: layout === "compact",
          style,
        })
      : null;

  const dims = { w: width, h: height, colors, copy, mono, layoutMetrics, style };

  if (layout === "compact") return buildCompactSvg(dims);
  if (layout === "seal") return buildSealSvg(dims);
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
    style = "classic",
    theme = "light",
    size = "md",
    showVerifier = true,
    publisherName,
    verifiedDate,
    className = "",
    linkHref,
  } = opts;

  const svg = renderBadgeSvg({
    tier,
    layout,
    style,
    theme,
    size,
    showVerifier,
    publisherName,
    verifiedDate,
  });
  const classes = [
    "ch-crs-cert-badge",
    `ch-crs-cert-badge--${layout}`,
    `ch-crs-cert-badge--${style}`,
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
  const { tier = "elite", theme = "light", layout = "primary", style = "classic", format = "svg" } = opts;
  const slug = CRS_TIER_SLUG[tier] || CRS_TIER_SLUG.elite;
  const themeSuffix = theme === "light" ? "" : `-${theme}`;
  const layoutSuffix = layout === "primary" ? "" : `-${layout}`;
  const styleSuffix = style === "classic" ? "" : `-${style}`;
  return `culture-hive-${slug}-badge${layoutSuffix}${styleSuffix}${themeSuffix}.${format}`;
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
