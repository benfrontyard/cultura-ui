/**
 * CRS certification records — separate from analysis scores.
 * Shared by Analysis Detail, Certifications Hub, and Public Verification.
 */

/** @typedef {'verified' | 'high' | 'elite'} CRSTier */
/** @typedef {'active' | 'pending' | 'expired' | 'revoked' | 'not_eligible'} CRSStatus */

/**
 * @typedef {object} CRSCertification
 * @property {string} id
 * @property {string} propertyName
 * @property {string} [publisherName]
 * @property {string} [propertyUrl]
 * @property {string} audienceSegment
 * @property {CRSTier} tier
 * @property {string} tierLabel
 * @property {number} [score]
 * @property {CRSStatus} status
 * @property {string} verifiedBy
 * @property {string} verifiedDate
 * @property {string} [expiresDate]
 * @property {string} analysisId
 * @property {{ preferredLayout?: string, preferredTheme?: string }} [layoutDefaults]
 */

export const CRS_CERTIFICATIONS = /** @type {CRSCertification[]} */ ([
  {
    id: "cert-espn-high-001",
    propertyName: "ESPN.com",
    publisherName: "ESPN",
    propertyUrl: "https://www.espn.com",
    audienceSegment: "Latino Millennial Sports Fans",
    tier: "high",
    tierLabel: "High CRS Score",
    score: 82,
    status: "active",
    verifiedBy: "Culture Hive",
    verifiedDate: "2026-06-04",
    expiresDate: "2027-06-04",
    analysisId: "analysis-espn-001",
    layoutDefaults: { preferredLayout: "compact", preferredTheme: "light" },
  },
  {
    id: "cert-iheart-elite-001",
    propertyName: "The Breakfast Club",
    publisherName: "iHeart Media",
    propertyUrl: "https://www.iheart.com",
    audienceSegment: "Latino Millennial Sports Fans",
    tier: "elite",
    tierLabel: "Elite CRS Score",
    score: 88,
    status: "active",
    verifiedBy: "Culture Hive",
    verifiedDate: "2026-06-18",
    expiresDate: "2027-06-18",
    analysisId: "analysis-iheart-breakfast-001",
    layoutDefaults: { preferredLayout: "primary", preferredTheme: "light" },
  },
  {
    id: "cert-nike-pending-001",
    propertyName: "Nike.com",
    publisherName: "Nike",
    propertyUrl: "https://www.nike.com",
    audienceSegment: "Gen Z Athleisure",
    tier: "high",
    tierLabel: "High CRS Score",
    score: 79,
    status: "pending",
    verifiedBy: "Culture Hive",
    verifiedDate: "2026-06-10",
    analysisId: "analysis-nike-001",
    layoutDefaults: { preferredLayout: "primary", preferredTheme: "light" },
  },
  {
    id: "cert-tubi-verified-001",
    propertyName: "Tubi",
    publisherName: "Fox Corporation",
    propertyUrl: "https://www.tubi.tv",
    audienceSegment: "Multicultural Streaming",
    tier: "verified",
    tierLabel: "CRS Verified",
    score: 68,
    status: "active",
    verifiedBy: "Culture Hive",
    verifiedDate: "2026-05-22",
    expiresDate: "2027-05-22",
    analysisId: "analysis-tubi-001",
    layoutDefaults: { preferredLayout: "compact", preferredTheme: "light" },
  },
]);

export const CRS_STATUS_LABELS = {
  active: "Active",
  pending: "Pending review",
  expired: "Expired",
  revoked: "Revoked",
  not_eligible: "Not eligible",
};

export const CRS_STATUS_PILL = {
  active: "ch-pill-success",
  pending: "ch-pill-warning",
  expired: "ch-pill-neutral",
  revoked: "ch-pill-danger",
  not_eligible: "ch-pill-neutral",
};

/** Certification score thresholds (prototype eligibility hints). */
export const CRS_CERT_THRESHOLDS = {
  verified: 60,
  high: 75,
  elite: 85,
};

/** @param {string} [prefix] */
export function buildVerifyUrl(id, prefix = "") {
  return `${prefix}crs-verify.html?id=${encodeURIComponent(id)}`;
}

/** @returns {CRSCertification[]} */
export function getCertifications() {
  return CRS_CERTIFICATIONS.slice();
}

/** @param {string} id @returns {CRSCertification | undefined} */
export function getCertificationById(id) {
  return CRS_CERTIFICATIONS.find((c) => c.id === id);
}

/** @param {string} analysisId @returns {CRSCertification | undefined} */
export function getCertificationForAnalysis(analysisId) {
  return CRS_CERTIFICATIONS.find((c) => c.analysisId === analysisId);
}

/**
 * @param {number} score
 * @returns {'elite' | 'high' | 'verified' | null}
 */
export function getSuggestedTierForScore(score) {
  if (score >= CRS_CERT_THRESHOLDS.elite) return "elite";
  if (score >= CRS_CERT_THRESHOLDS.high) return "high";
  if (score >= CRS_CERT_THRESHOLDS.verified) return "verified";
  return null;
}

/**
 * @param {number} score
 * @param {CRSCertification | undefined} cert
 * @returns {'certified' | 'pending' | 'eligible' | 'below_threshold'}
 */
export function getAnalysisCertificationState(score, cert) {
  if (cert?.status === "active") return "certified";
  if (cert?.status === "pending") return "pending";
  if (getSuggestedTierForScore(score)) return "eligible";
  return "below_threshold";
}

/** @param {string} isoDate */
export function formatCertDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
