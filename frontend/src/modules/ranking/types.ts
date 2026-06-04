import type { ConversionMetrics } from "./conversion-tracker";

export interface RankingListingInput {
    id: string;
    type: "GUIDE_PROFILE" | "CORPORATE_TOUR";
    createdAt: Date;
    updatedAt: Date;
    filled: number;
    quota: number;
    price: number;
    city: string;
    departureCity?: string;
    startDate: Date;
    endDate: Date;
}

export interface RankingGuideInput {
    userId: string;
    packageType: string;
    isIdentityVerified: boolean;
    trustScore: number;       // Int 0–100
    completedTrips: number;
    profileCompleteness: number; // 0–100
    avgResponseHours: number;
    recentActivityCount: number; // Last 30 days
    riskTier?: string;        // GREEN | YELLOW | ORANGE | RED | BLACK
    avgReviewRating: number;  // 0–5
    reviewCount: number;
    concentrationPenalty?: number; // 0.0–0.60, from review-concentration.ts
    accountAgeDays: number;
    totalListingsCreated: number;
    agencyCity?: string;
}

export interface RankingBoostInput {
    isActive: boolean;
    effectivePower: number;   // 0.0–1.0 (already decayed by duration)
    activeBoostCount: number;
    boostTier?: "BASIC" | "PREMIUM" | "ELITE";
}

export interface PersonalizationInput {
    userId: string | null;
    preferredPriceMin?: number;
    preferredPriceMax?: number;
    searchedCities?: string[];
    clickedListingIds?: string[];
    ignoredListingIds?: string[];
}

export interface QueryIntentInput {
    type: "BROWSE" | "PRICE_SENSITIVE" | "QUALITY_SEEKING" | "DATE_SPECIFIC" | "LOCATION_SPECIFIC";
}

export interface ScoringResult {
    listingId: string;
    finalScore: number;
    organicScore: number;
    boostComponent: number;
    qualityScore: number;
    trustScore: number;
    reviewQualityScore: number;
    slaScore: number;
    activityScore: number;
    freshnessScore: number;
    personalizationAdjust: number;
    fillPenalty: number;
    priorityBonus: number;
    breakdown: string;
}

export interface RankedListing extends ScoringResult {
    position: number;
}
