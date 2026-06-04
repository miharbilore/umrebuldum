import type { ConversionMetrics } from "./conversion-tracker";
import { RankingGuideInput, RankingListingInput } from "./types";
import { clamp } from "./utils";
import { COLD_START_DAYS, COLD_START_BONUS } from "./constants";

// ─── Factor 1: Quality Score (0.0 – 1.0) ───────────────────────────

export function computeQuality(
    guide: RankingGuideInput,
    conversion: ConversionMetrics | null,
): number {
    // 1a. Conversion score (max 0.40 = 40% of quality)
    let conversionScore = 0;
    if (conversion && conversion.impressions > 10) {
        const ctrComponent = clamp(conversion.ctr * 2500, 0, 0.30);
        const dwellComponent = clamp(conversion.avgDwellTimeMs / 120_000, 0, 0.10);
        conversionScore = ctrComponent + dwellComponent;
    }

    // 1b. Profile completeness (max 0.20)
    const profileScore = (guide.profileCompleteness / 100) * 0.20;

    // 1c. Completed trips (max 0.20) — logarithmic: diminishing returns
    const tripScore = clamp(Math.log2(guide.completedTrips + 1) / 4, 0, 0.20);

    // 1d. Recent activity (max 0.20)
    const activityScore = clamp(guide.recentActivityCount / 30, 0, 0.20);

    return clamp(conversionScore + profileScore + tripScore + activityScore, 0, 1);
}

// ─── Factor 2: Trust Score (0.0 – 1.0) ─────────────────────────────

export function computeTrust(guide: RankingGuideInput): number {
    // Risk tier overrides — hard enforcement
    if (guide.riskTier === "RED" || guide.riskTier === "BLACK") return 0;
    if (guide.riskTier === "ORANGE") return 0.25;
    if (guide.riskTier === "YELLOW") return clamp(guide.trustScore / 100, 0, 0.65);

    // Normal: direct mapping from 0-100 → 0.0-1.0
    let base = guide.trustScore / 100;

    // Identity verified bonus (+0.10, capped at 1.0)
    if (guide.isIdentityVerified) {
        base = Math.min(1.0, base + 0.10);
    }

    return clamp(base, 0, 1);
}

export function isColdStartEligible(guide: RankingGuideInput): boolean {
    return guide.isIdentityVerified &&
        guide.accountAgeDays <= COLD_START_DAYS &&
        guide.totalListingsCreated <= 3;
}

// ─── Factor 3: Review Quality (0.0 – 1.0) ──────────────────────────

export function computeReviewQuality(guide: RankingGuideInput, listing?: RankingListingInput): number {
    if (guide.reviewCount === 0) {
        // Verified newcomer floor logic: Account-based to prevent delete/recreate abuse
        if (isColdStartEligible(guide)) {
            return 0.40; // Artificial floor for first 14 days
        }
        return 0;
    }

    // 3a. Rating score (max 0.60) — direct mapping from 0-5 star
    const ratingScore = (guide.avgReviewRating / 5.0) * 0.60;

    // 3b. Volume score (max 0.25) — logarithmic: 1=0, 2=5%, 8=15%, 32=25%
    const volumeScore = clamp(Math.log2(guide.reviewCount + 1) / 5, 0, 0.25);

    // 3c. Diversity bonus (0.15 if 5+ reviews)
    const diversityBonus = guide.reviewCount >= 5 ? 0.15 : 0;

    const raw = clamp(ratingScore + volumeScore + diversityBonus, 0, 1);

    // Apply review concentration penalty (from review-concentration.ts)
    // concentrationPenalty: 0.0=clean, up to 0.60=heavy farm
    const penalty = guide.concentrationPenalty ?? 0;
    return raw * (1 - penalty);
}

// ─── Factor 4: SLA Score (0.0 – 1.0) ───────────────────────────────

export function computeSLA(guide: RankingGuideInput): number {
    const hrs = guide.avgResponseHours;
    if (hrs <= 1) return 1.0;
    if (hrs <= 4) return 0.80;
    if (hrs <= 12) return 0.50;
    if (hrs <= 24) return 0.30;
    return 0.10;
}

// ─── Factor 5: Activity Score (0.0 – 1.0) ──────────────────────────

export function computeActivity(guide: RankingGuideInput): number {
    return clamp(guide.recentActivityCount / 30, 0, 1);
}

// ─── Factor 6: Freshness Score (0.0 – 1.0) ─────────────────────────

export function computeFreshness(listing: RankingListingInput, guide: RankingGuideInput): number {
    const now = Date.now();
    const daysSinceUpdate = (now - listing.updatedAt.getTime()) / 86_400_000;

    // Recency tiers
    let recency: number;
    if (daysSinceUpdate <= 1) recency = 1.0;
    else if (daysSinceUpdate <= 7) recency = 0.80;
    else if (daysSinceUpdate <= 30) recency = 0.50;
    else if (daysSinceUpdate <= 90) recency = 0.30;
    else recency = 0.10;

    // Cold-start bonus: Account-based (prevents delete/recreate abuse)
    let coldStartBonus = 0;
    if (isColdStartEligible(guide)) {
        coldStartBonus = COLD_START_BONUS * (1 - guide.accountAgeDays / COLD_START_DAYS);
    }

    return clamp(recency + coldStartBonus, 0, 1);
}
