// ─── Scoring Engine ─────────────────────────────────────────────────────────────
// Migrated from legacy lib/listing-ranking.ts to Domain Layer.
// Standardized for 5-token economy and DDD.

import { PACKAGE_LIMITS } from "@/lib/package-system";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ListingInput {
    type: "GUIDE_PROFILE" | "CORPORATE_TOUR";
    id?: string | number;
    isFeatured: boolean;
    featuredUntil: Date | null;
    boostScore: number;
    updatedAt: Date;
    createdAt: Date;
    filled: number;
    quota: number;
    price: number;
    city: string;
}

export interface GuideInput {
    packageType: string;
    isIdentityVerified: boolean;
    trustScore: number;
    completedTrips: number;
    profileCompleteness: number;
    avgResponseHours: number;
    recentActivityCount: number;
    reviewCount: number;
}

export interface CorporateInput {
    packageType: string;
    hasSpotlight: boolean;
    hasPremiumBanner: boolean;
    lastActivityAt: Date;
}

// ── Weight Constants ────────────────────────────────────────────────────────

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
    SPOTLIGHT: 1500,
    PREMIUM_BANNER: 800,
    BOOST_ACTIVE: 500,
    BOOST_SCORE_MULTI: 1,
    PACKAGE_ENTERPRISE: 400,
    PACKAGE_PRO: 250,
    PACKAGE_BASIC: 100,
    ACTIVITY_MAX: 200,
    FRESHNESS_MAX: 200,
    FILL_PENALTY_MAX: -150,
} as const;

// ── Scoring Functions ──────────────────────────────────────────────────────

export function scoreGuideListing(listing: ListingInput, guide: GuideInput): number {
    const now = Date.now();

    let packageScore: number = GUIDE_WEIGHTS.PACKAGE_FREEMIUM;
    switch (guide.packageType) {
        case "BUSINESS_PLUS": packageScore = GUIDE_WEIGHTS.PACKAGE_LEGEND; break;
        case "BUSINESS": packageScore = GUIDE_WEIGHTS.PACKAGE_LEGEND; break;
        case "PRO": packageScore = GUIDE_WEIGHTS.PACKAGE_PRO; break;
        case "PLUS": packageScore = GUIDE_WEIGHTS.PACKAGE_STARTER; break;
        case "PREMIUM": packageScore = GUIDE_WEIGHTS.PACKAGE_STARTER; break;
    }

    const identityBadge = guide.isIdentityVerified ? GUIDE_WEIGHTS.IDENTITY_VERIFIED : 0;

    let responseScore: number = GUIDE_WEIGHTS.RESPONSE_TIME_SLOW;
    if (guide.avgResponseHours <= 1) responseScore = GUIDE_WEIGHTS.RESPONSE_TIME_FAST;
    else if (guide.avgResponseHours <= 6) responseScore = GUIDE_WEIGHTS.RESPONSE_TIME_MED;

    const activityRatio = Math.min(guide.recentActivityCount / 30, 1);
    const activityScore = Math.round(GUIDE_WEIGHTS.ACTIVITY_MAX * activityRatio);

    const boostActive =
        listing.isFeatured && listing.featuredUntil && listing.featuredUntil.getTime() > now
            ? GUIDE_WEIGHTS.BOOST_ACTIVE
            : 0;
    const boostRaw = listing.boostScore * GUIDE_WEIGHTS.BOOST_SCORE_MULTI;

    const profileScore = Math.round(
        (guide.profileCompleteness / 100) * GUIDE_WEIGHTS.PROFILE_COMPLETE_MAX
    );

    const trustScoreValue = Math.min(guide.trustScore, 100) * GUIDE_WEIGHTS.TRUST_SCORE_MULTI;
    const tripScore = Math.min(guide.completedTrips * GUIDE_WEIGHTS.TRIPS_MULTI, 250);

    const daysSinceUpdate = (now - listing.updatedAt.getTime()) / 86_400_000;
    const freshness = Math.max(0, GUIDE_WEIGHTS.FRESHNESS_MAX - daysSinceUpdate * 4);

    const fillPenalty = listing.quota > 0
        ? (listing.filled / listing.quota) * GUIDE_WEIGHTS.FILL_PENALTY_MAX
        : 0;

    return Math.round(
        packageScore + identityBadge + responseScore + activityScore +
        boostActive + boostRaw + profileScore + trustScoreValue + tripScore +
        freshness + fillPenalty
    );
}

export function scoreCorporateListing(listing: ListingInput, corp: CorporateInput): number {
    // ... (logic from legacy lib/listing-ranking.ts)
    const now = Date.now();
    const spotlight = corp.hasSpotlight ? CORP_WEIGHTS.SPOTLIGHT : 0;
    const banner = corp.hasPremiumBanner ? CORP_WEIGHTS.PREMIUM_BANNER : 0;
    const boostActive = listing.isFeatured && listing.featuredUntil && listing.featuredUntil.getTime() > now ? CORP_WEIGHTS.BOOST_ACTIVE : 0;
    const boostRaw = listing.boostScore * CORP_WEIGHTS.BOOST_SCORE_MULTI;

    let packageScore = CORP_WEIGHTS.PACKAGE_BASIC;
    if (corp.packageType === "CORP_ENTERPRISE") packageScore = CORP_WEIGHTS.PACKAGE_ENTERPRISE;
    else if (corp.packageType === "CORP_PRO") packageScore = CORP_WEIGHTS.PACKAGE_PRO;

    const daysSinceActivity = (now - corp.lastActivityAt.getTime()) / 86_400_000;
    const activityScore = daysSinceActivity <= 7 ? CORP_WEIGHTS.ACTIVITY_MAX : Math.max(0, CORP_WEIGHTS.ACTIVITY_MAX - (daysSinceActivity - 7) * 10);

    const daysSinceUpdate = (now - listing.updatedAt.getTime()) / 86_400_000;
    const freshness = Math.max(0, CORP_WEIGHTS.FRESHNESS_MAX - daysSinceUpdate * 4);
    const fillPenalty = listing.quota > 0 ? (listing.filled / listing.quota) * CORP_WEIGHTS.FILL_PENALTY_MAX : 0;

    return Math.round(spotlight + banner + boostActive + boostRaw + packageScore + activityScore + freshness + fillPenalty);
}

export function calculateListingScore(listing: ListingInput, owner: GuideInput | CorporateInput): number {
    if (listing.type === "GUIDE_PROFILE") {
        return scoreGuideListing(listing, owner as GuideInput);
    }
    if (listing.type === "CORPORATE_TOUR") {
        return scoreCorporateListing(listing, owner as CorporateInput);
    }
    return 0;
}

export function calculateProfileCompleteness(user: {
    fullName?: string | null;
    phone?: string | null;
    bio?: string | null;
    photo?: string | null;
    city?: string | null;
    isIdentityVerified?: boolean;
}): number {
    let score = 0;
    const weights = { fullName: 25, phone: 15, bio: 20, photo: 25, city: 10, identity: 5 };
    if (user.fullName?.trim()) score += weights.fullName;
    if (user.phone?.trim()) score += weights.phone;
    if (user.bio?.trim() && user.bio.length >= 50) score += weights.bio;
    if (user.photo) score += weights.photo;
    if (user.city?.trim()) score += weights.city;
    if (user.isIdentityVerified) score += weights.identity;
    return Math.min(score, 100);
}
