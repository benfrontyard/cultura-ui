/**
 * Example badge placements — product UI and publisher mockups.
 */
import { renderBadgeHtml, CRS_BADGE_TOOLTIP } from "./crs-certification-badge.js";
import { buildVerifyUrl } from "../data/crs-certifications.js";

/**
 * @param {HTMLElement} container
 */
export function renderBadgeExamplePlacements(container) {
  if (!container) return;

  const verifyIheart = buildVerifyUrl("cert-iheart-elite-001");

  container.innerHTML = `
    <div class="row g-4">
      <!-- Property card -->
      <div class="col-lg-6">
        <div class="ch-crs-placement">
          <div class="ch-crs-placement__header">
            <div class="ch-crs-placement__label">Property card</div>
          </div>
          <div class="ch-crs-placement__body">
            <div class="ch-crs-property-card">
              <img class="ch-brand-logo" src="https://www.google.com/s2/favicons?domain=iheart.com&amp;sz=64" alt="" width="32" height="32" decoding="async" />
              <div class="ch-crs-property-card__meta">
                <div class="ch-crs-property-card__title">The Breakfast Club</div>
                <div class="text-ch-secondary small">iHeartRadio · Podcast · Latino Millennial Sports Fans</div>
                <div class="d-flex align-items-center gap-2 mt-2">
                  <span class="fw-semibold text-success">CRS 88</span>
                  <span class="text-ch-muted small">Elite tier</span>
                </div>
              </div>
              ${renderBadgeHtml({ tier: "elite", layout: "compact", theme: "light", size: "sm", linkHref: verifyIheart })}
            </div>
          </div>
        </div>
      </div>

      <!-- Publisher detail header -->
      <div class="col-lg-6">
        <div class="ch-crs-placement">
          <div class="ch-crs-placement__header">
            <div class="ch-crs-placement__label">Publisher page header</div>
          </div>
          <div class="ch-crs-placement__body">
            <div class="ch-crs-publisher-header">
              <img class="ch-brand-logo ch-brand-logo--lg" src="https://www.google.com/s2/favicons?domain=iheart.com&amp;sz=64" alt="" width="40" height="40" decoding="async" />
              <div class="min-w-0">
                <h3 class="h5 mb-0">iHeart Media</h3>
                <div class="text-ch-secondary small">Publisher · 12 properties analyzed</div>
              </div>
              ${renderBadgeHtml({ tier: "elite", layout: "compact", theme: "light", size: "md", linkHref: verifyIheart })}
            </div>
          </div>
        </div>
      </div>

      <!-- Report module -->
      <div class="col-lg-6">
        <div class="ch-crs-placement">
          <div class="ch-crs-placement__header">
            <div class="ch-crs-placement__label">Report module</div>
          </div>
          <div class="ch-crs-placement__body">
            <div class="d-flex align-items-start justify-content-between gap-3">
              <div>
                <div class="fw-semibold mb-1">Cultural relevance summary</div>
                <p class="text-ch-secondary small mb-0">ESPN.com scores 82 for Latino Millennial Sports Fans — strong editorial alignment and audience resonance.</p>
              </div>
              ${renderBadgeHtml({ tier: "high", layout: "compact", theme: "light", size: "sm" })}
            </div>
          </div>
        </div>
      </div>

      <!-- Media plan recommendation -->
      <div class="col-lg-6">
        <div class="ch-crs-placement">
          <div class="ch-crs-placement__header">
            <div class="ch-crs-placement__label">Media plan recommendation</div>
          </div>
          <div class="ch-crs-placement__body">
            <div class="ch-card border mb-0">
              <div class="ch-card-body py-3">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div class="fw-semibold">Power 105.1 FM</div>
                    <div class="text-ch-muted small">Recommended · CRS 91</div>
                  </div>
                  ${renderBadgeHtml({ tier: "elite", layout: "compact", theme: "light", size: "sm" })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sales deck -->
      <div class="col-lg-6">
        <div class="ch-crs-placement">
          <div class="ch-crs-placement__header">
            <div class="ch-crs-placement__label">Media kit / sales deck</div>
          </div>
          <div class="ch-crs-placement__body">
            <div class="ch-crs-deck-slide">
              <div class="ch-crs-deck-slide__title">Reach culturally connected audiences</div>
              <div class="ch-crs-deck-slide__footer">
                <span class="small opacity-75">iHeart Media · Q3 2026</span>
                ${renderBadgeHtml({ tier: "elite", layout: "primary", theme: "dark", size: "sm" })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Print one-sheet -->
      <div class="col-lg-6">
        <div class="ch-crs-placement">
          <div class="ch-crs-placement__header">
            <div class="ch-crs-placement__label">Print one-sheet</div>
          </div>
          <div class="ch-crs-placement__body">
            <div class="ch-crs-print-sheet">
              ${renderBadgeHtml({ tier: "elite", layout: "primary", theme: "mono", size: "md" })}
              <div class="ch-crs-print-sheet__copy">
                <div class="ch-crs-print-sheet__headline">Elite CRS Score</div>
                <p class="text-ch-secondary small mb-0">This property has achieved an Elite CRS Score for Latino Millennial Sports Fans. Verified by Culture Hive, June 2026.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Public publisher website -->
      <div class="col-12">
        <div class="ch-crs-placement">
          <div class="ch-crs-placement__header">
            <div class="ch-crs-placement__label">Public publisher website (iHeart-style)</div>
          </div>
          <div class="ch-crs-placement__body p-0">
            <div class="ch-crs-public-site">
              <div class="ch-crs-public-site__nav">
                <span>iHeart</span>
                <span class="opacity-50">Radio</span>
                <span class="opacity-50">Podcasts</span>
              </div>
              <div class="ch-crs-public-site__hero">
                <div class="ch-crs-public-site__show">The Breakfast Club</div>
                <p class="small opacity-75 mb-0">Weekday mornings · Hip-hop &amp; culture</p>
                <div class="ch-crs-public-site__badge-row">
                  ${renderBadgeHtml({ tier: "elite", layout: "seal", theme: "dark", size: "md", linkHref: verifyIheart })}
                  <span class="small opacity-50" title="${CRS_BADGE_TOOLTIP.replace(/"/g, "&quot;")}">What is CRS?</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
