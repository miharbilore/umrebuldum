// â”€â”€â”€ Listing Ranking Algorithm (LEGACY) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// @deprecated Use `src/modules/ranking/ranking-engine.ts` instead.
// This file is kept for backward compatibility only.
// New code should import from the ranking-engine module.
//
// The new 5-pillar engine provides:
//   - Conversion-weighted scoring
//   - Trust multiplier (not additive)
//   - Boost hard-capped at 200 (anti-pay-to-win)
//   - Personalization layer
//   - Cold-start bonus
//   - EMA smoothing (anti-oscillation)

import { PACKAGE_LIMITS } from "./package-system";
import type { PackageType } from "./db-types";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ListingInput {
    type: "GUIDE_PROFILE" | "CORPORATE_TOUR";
    isFeatured: boolean;
    featuredUntil: Date | null;
    boostScore: number;
    updatedAt: Date;
    createdAt: Date;
    filled: number;
    quota: number;
}

interface GuideInput {
    packageType: string;
    isIdentityVerified: boolean;
    trustScore: number;
    completedTrips: number;
    // Profile completeness (0-100)
    profileCompleteness: number;
    // Average response time in hours (lower = better)
    avgResponseHours: number;
    // Activity: how many actions in last 90 days
    recentActivityCount: number;
}

interface CorporateInput {
    packageType: string;
    hasSpotlight: boolean;       // Active spotlight purchase
    hasPremiumBanner: boolean;   // Active premium banner
    lastActivityAt: Date;
}

// â”€â”€ Weight Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const GUIDE_WEIGHTS = {
    PACKAGE_LEGEND: 400,
    PACKAGE_PRO: 250,
    PACKAGE_STARTER: 100,
    PACKAGE_FREEMIUM: 0,
    IDENTITY_VERIFIED: 300,
    RESPONSE_TIME_FAST: 200,     // < 1 hour
    RESPONSE_TIME_MED: 100,      // < 6 hours
    RESPONSE_TIME_SLOW: 0,       // > 6 hours
    ACTIVITY_MAX: 200,           // 30+ actions in 90 days
    BOOST_ACTIVE: 500,           // isFeatured && featuredUntil > now
    BOOST_SCORE_MULTI: 1,        // boostScore directly added
    PROFILE_COMPLETE_MAX: 150,   // 100% profile = 150 points
    TRUST_SCORE_MULTI: 2,        // trustScore × 2
    TRIPS_MULTI: 5,              // completedTrips × 5, capped at 250
    FRESHNESS_MAX: 200,          // Updated today = 200, decays 4/day
    FILL_PENALTY_MAX: -150,      // 100% filled = -150
} as const;

const CORP_WEIGHTS = {
    SPOTLIGHT: 1500,             // Homepage spotlight (highest)
    PREMIUM_BANNER: 800,        // Premium banner placement
    BOOST_ACTIVE: 500,
    BOOST_SCORE_MULTI: 1,
    PACKAGE_ENTERPRISE: 400,
    PACKAGE_PRO: 250,
    PACKAGE_BASIC: 100,
    ACTIVITY_MAX: 200,           // Active in last 7 days
    FRESHNESS_MAX: 200,
    FILL_PENALTY_MAX: -150,
} as const;

// â”€â”€ Guide Ranking â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Score a GUIDE_PROFILE listing.
 *
 * Formula:
 *   packageScore         (0-400)
 * + identityBonus        (0 or 300)
 * + responseTimeScore    (0-200)
 * + activityScore        (0-200)
 * + boostScore           (0-500 + raw boostScore)
 * + profileScore         (0-150)
 * + trustScore           (0-200)
 * + tripScore            (0-250)
 * + freshnessScore       (0-200)
 * + fillPenalty           (-150..0)
 *
 * Theoretical range: -150 to ~2650
 */
export function scoreGuideListing(listing: ListingInput, guide: GuideInput): number {
    const now = Date.now();

    // â”€â”€ 1. Package tier â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let packageScore: number = GUIDE_WEIGHTS.PACKAGE_FREEMIUM;
    switch (guide.packageType) {
        case "BUSINESS_PLUS": packageScore = GUIDE_WEIGHTS.PACKAGE_LEGEND; break;
        case "BUSINESS": packageScore = GUIDE_WEIGHTS.PACKAGE_LEGEND; break;
        case "PRO": packageScore = GUIDE_WEIGHTS.PACKAGE_PRO; break;
        case "PLUS": packageScore = GUIDE_WEIGHTS.PACKAGE_STARTER; break;
        case "PREMIUM": packageScore = GUIDE_WEIGHTS.PACKAGE_STARTER; break;
    }

    // â”€â”€ 2. Identity badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const identityBadge = guide.isIdentityVerified ? GUIDE_WEIGHTS.IDENTITY_VERIFIED : 0;

    // â”€â”€ 3. Response time â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let responseScore: number = GUIDE_WEIGHTS.RESPONSE_TIME_SLOW;
    if (guide.avgResponseHours <= 1) responseScore = GUIDE_WEIGHTS.RESPONSE_TIME_FAST;
    else if (guide.avgResponseHours <= 6) responseScore = GUIDE_WEIGHTS.RESPONSE_TIME_MED;

    // â”€â”€ 4. Recent activity (last 90 days) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const activityRatio = Math.min(guide.recentActivityCount / 30, 1);
    const activityScore = Math.round(GUIDE_WEIGHTS.ACTIVITY_MAX * activityRatio);

    // â”€â”€ 5. Boost â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const boostActive =
        listing.isFeatured && listing.featuredUntil && listing.featuredUntil.getTime() > now
            ? GUIDE_WEIGHTS.BOOST_ACTIVE
            : 0;
    const boostRaw = listing.boostScore * GUIDE_WEIGHTS.BOOST_SCORE_MULTI;

    // â”€â”€ 6. Profile completeness â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const profileScore = Math.round(
        (guide.profileCompleteness / 100) * GUIDE_WEIGHTS.PROFILE_COMPLETE_MAX
    );

    // â”€â”€ 7. Trust & trips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const trustScore = Math.min(guide.trustScore, 100) * GUIDE_WEIGHTS.TRUST_SCORE_MULTI;
    const tripScore = Math.min(guide.completedTrips * GUIDE_WEIGHTS.TRIPS_MULTI, 250);

    // â”€â”€ 8. Freshness (decays 4 points per day) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const daysSinceUpdate = (now - listing.updatedAt.getTime()) / 86_400_000;
    const freshness = Math.max(0, GUIDE_WEIGHTS.FRESHNESS_MAX - daysSinceUpdate * 4);

    // â”€â”€ 9. Fill rate penalty â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fillPenalty = listing.quota > 0
        ? (listing.filled / listing.quota) * GUIDE_WEIGHTS.FILL_PENALTY_MAX
        : 0;

    return Math.round(
        packageScore + identityBadge + responseScore + activityScore +
        boostActive + boostRaw + profileScore + trustScore + tripScore +
        freshness + fillPenalty
    );
}

// â”€â”€ Corporate Ranking â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Score a CORPORATE_TOUR listing.
 *
 * Formula:
 *   spotlightBonus       (0 or 1500)
 * + premiumBannerBonus   (0 or 800)
 * + boostScore           (0-500 + raw)
 * + packageScore         (0-400)
 * + activityScore        (0-200)
 * + freshnessScore       (0-200)
 * + fillPenalty           (-150..0)
 *
 * Theoretical range: -150 to ~3600
 */
export function scoreCorporateListing(listing: ListingInput, corp: CorporateInput): number {
    const now = Date.now();

    // â”€â”€ 1. Spotlight (highest priority) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const spotlight = corp.hasSpotlight ? CORP_WEIGHTS.SPOTLIGHT : 0;

    // â”€â”€ 2. Premium banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const banner = corp.hasPremiumBanner ? CORP_WEIGHTS.PREMIUM_BANNER : 0;

    // â”€â”€ 3. Boost â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const boostActive =
        listing.isFeatured && listing.featuredUntil && listing.featuredUntil.getTime() > now
            ? CORP_WEIGHTS.BOOST_ACTIVE
            : 0;
    const boostRaw = listing.boostScore * CORP_WEIGHTS.BOOST_SCORE_MULTI;

    // â”€â”€ 4. Package tier â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let packageScore: number = CORP_WEIGHTS.PACKAGE_BASIC;
    switch (corp.packageType) {
        case "CORP_ENTERPRISE": packageScore = CORP_WEIGHTS.PACKAGE_ENTERPRISE; break;
        case "CORP_PRO": packageScore = CORP_WEIGHTS.PACKAGE_PRO; break;
    }

    // â”€â”€ 5. Recent activity (bonus if active in last 7 days) â”€â”€â”€â”€â”€â”€â”€
    const daysSinceActivity = (now - corp.lastActivityAt.getTime()) / 86_400_000;
    const activityScore = daysSinceActivity <= 7
        ? CORP_WEIGHTS.ACTIVITY_MAX
        : Math.max(0, CORP_WEIGHTS.ACTIVITY_MAX - (daysSinceActivity - 7) * 10);

    // â”€â”€ 6. Freshness â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const daysSinceUpdate = (now - listing.updatedAt.getTime()) / 86_400_000;
    const freshness = Math.max(0, CORP_WEIGHTS.FRESHNESS_MAX - daysSinceUpdate * 4);

    // â”€â”€ 7. Fill rate penalty â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fillPenalty = listing.quota > 0
        ? (listing.filled / listing.quota) * CORP_WEIGHTS.FILL_PENALTY_MAX
        : 0;

    return Math.round(
        spotlight + banner + boostActive + boostRaw +
        packageScore + activityScore + freshness + fillPenalty
    );
}

// â”€â”€ Unified Scorer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Score any listing. Dispatches to the correct formula based on type.
 * Returns 0 for unknown types.
 */
export function calculateListingScore(
    listing: ListingInput,
    owner: GuideInput | CorporateInput,
): number {
    if (listing.type === "GUIDE_PROFILE") {
        return scoreGuideListing(listing, owner as GuideInput);
    }
    if (listing.type === "CORPORATE_TOUR") {
        return scoreCorporateListing(listing, owner as CorporateInput);
    }
    return 0;
}

// â”€â”€ Profile Completeness Calculator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Calculate profile completeness as 0-100 percentage.
 * Each field contributes to the total score.
 */
export function calculateProfileCompleteness(user: {
    fullName?: string | null;
    phone?: string | null;
    bio?: string | null;
    photo?: string | null;
    city?: string | null;
    isIdentityVerified?: boolean;
}): number {
    let score = 0;
    const weights = {
        fullName: 25,
        phone: 15,
        bio: 20,
        photo: 25,
        city: 10,
        identity: 5,
    };

    if (user.fullName?.trim()) score += weights.fullName;
    if (user.phone?.trim()) score += weights.phone;
    if (user.bio?.trim() && user.bio.length >= 50) score += weights.bio;
    if (user.photo) score += weights.photo;
    if (user.city?.trim()) score += weights.city;
    if (user.isIdentityVerified) score += weights.identity;

    return Math.min(score, 100);
}
