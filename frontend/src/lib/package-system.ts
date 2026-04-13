// â”€â”€â”€ Package Limits & Token Economy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Source of truth for all package capabilities and token pricing.

import type { PackageType } from "./db-types";
import { prisma } from "./prisma";

// â”€â”€ Token Costs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const TOKEN_COSTS = {
    LISTING_CREATE: 10,
    OFFER_SEND: 5,
    DEMAND_UNLOCK: 3,
    BOOST: 15,
    SPOTLIGHT: 25,
    REPUBLISH: 2,
    REFRESH: 1,
} as const;


// â”€â”€ Daily Hard Caps (per package) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface DailyCaps {
    offers: number;
    unlocks: number;
    boosts: number;
    spotlights: number;
}

export const DAILY_CAPS: Record<PackageType, DailyCaps> = {
    FREEMIUM:      { offers: 1,   unlocks: 0,  boosts: 0,  spotlights: 0 },
    PREMIUM:       { offers: 5,   unlocks: 3,  boosts: 1,  spotlights: 0 },
    PLUS:          { offers: 10,  unlocks: 5,  boosts: 2,  spotlights: 1 },
    PRO:           { offers: 20,  unlocks: 15, boosts: 5,  spotlights: 2 },
    BUSINESS:      { offers: 50,  unlocks: 30, boosts: 10, spotlights: 3 },
    BUSINESS_PLUS: { offers: 100, unlocks: 50, boosts: 30, spotlights: 10 },
};

// â”€â”€ Package Limits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PackageLimits {
    maxListings: number;
    listingDays: number;
    initialTokens: number;       // One-time signup grant
    monthlyTokens: number;       // Per subscription renewal
    softCap: number;             // Max accumulation for subscription tokens
    maxDailyOffers: number;
    maxBoosts: number;
    boostDays: number;
    phoneVisible: boolean;
    featuredEligible: boolean;
    priorityRanking: boolean;
    trustBoost: boolean;
    identityVerificationEligible: boolean;
    spotlightEligible: boolean;
    posterQuality: "LOW" | "NORMAL" | "HIGH";
    canCreatePoster: boolean;
    watermark: boolean;
    aiGenerator: boolean;
}

export const PACKAGE_LIMITS: Record<PackageType, PackageLimits> = {
    // â”€â”€ Rehber/Kurumsal FREEMIUM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    FREEMIUM: {
        maxListings: 1,
        listingDays: 30,
        initialTokens: 15,
        monthlyTokens: 0,
        softCap: 15,
        maxDailyOffers: 1,
        maxBoosts: 0,
        boostDays: 0,
        phoneVisible: false,
        featuredEligible: false,
        priorityRanking: false,
        trustBoost: false,
        identityVerificationEligible: true,
        spotlightEligible: false,
        posterQuality: "LOW",
        canCreatePoster: false,
        watermark: true,
        aiGenerator: false,
    },
    // â”€â”€ Rehber Premium â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    PREMIUM: {
        maxListings: 3,
        listingDays: 60,
        initialTokens: 50,
        monthlyTokens: 50,
        softCap: 100,
        maxDailyOffers: 5,
        maxBoosts: 1,
        boostDays: 3,
        phoneVisible: true,
        featuredEligible: false,
        priorityRanking: false,
        trustBoost: false,
        identityVerificationEligible: true,
        spotlightEligible: false,
        posterQuality: "NORMAL",
        canCreatePoster: true,
        watermark: true,
        aiGenerator: false,
    },
    // â”€â”€ Rehber Plus â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    PLUS: {
        maxListings: 5,
        listingDays: 90,
        initialTokens: 100,
        monthlyTokens: 100,
        softCap: 200,
        maxDailyOffers: 10,
        maxBoosts: 3,
        boostDays: 5,
        phoneVisible: true,
        featuredEligible: true,
        priorityRanking: true,
        trustBoost: false,
        identityVerificationEligible: true,
        spotlightEligible: true,
        posterQuality: "NORMAL",
        canCreatePoster: true,
        watermark: false,
        aiGenerator: false,
    },
    // â”€â”€ Rehber Pro â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    PRO: {
        maxListings: 15,
        listingDays: 180,
        initialTokens: 200,
        monthlyTokens: 200,
        softCap: 400,
        maxDailyOffers: 20,
        maxBoosts: 5,
        boostDays: 7,
        phoneVisible: true,
        featuredEligible: true,
        priorityRanking: true,
        trustBoost: true,
        identityVerificationEligible: true,
        spotlightEligible: true,
        posterQuality: "HIGH",
        canCreatePoster: true,
        watermark: false,
        aiGenerator: true,
    },
    // â”€â”€ Kurumsal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    BUSINESS: {
        maxListings: 30,
        listingDays: 180,
        initialTokens: 500,
        monthlyTokens: 500,
        softCap: 1000,
        maxDailyOffers: 50,
        maxBoosts: 10,
        boostDays: 7,
        phoneVisible: true,
        featuredEligible: true,
        priorityRanking: true,
        trustBoost: true,
        identityVerificationEligible: true,
        spotlightEligible: true,
        posterQuality: "HIGH",
        canCreatePoster: true,
        watermark: false,
        aiGenerator: false,
    },
    // â”€â”€ Kurumsal Plus â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    BUSINESS_PLUS: {
        maxListings: 100,
        listingDays: 365,
        initialTokens: 1000,
        monthlyTokens: 1000,
        softCap: 2000,
        maxDailyOffers: 100,
        maxBoosts: 30,
        boostDays: 14,
        phoneVisible: true,
        featuredEligible: true,
        priorityRanking: true,
        trustBoost: true,
        identityVerificationEligible: true,
        spotlightEligible: true,
        posterQuality: "HIGH",
        canCreatePoster: true,
        watermark: false,
        aiGenerator: true,
    },
};

// â”€â”€ Token Pricing (Ek Satın Alma) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const TOKEN_PACKAGES = [
    { id: "small", tokens: 10, priceTRY: 49, unitPrice: 4.90 },
    { id: "medium", tokens: 30, priceTRY: 119, unitPrice: 3.97 },
    { id: "large", tokens: 75, priceTRY: 249, unitPrice: 3.32 },
    { id: "mega", tokens: 200, priceTRY: 549, unitPrice: 2.75 },
    { id: "enterprise", tokens: 500, priceTRY: 999, unitPrice: 2.00 },
] as const;

/**
 * Logarithmic unit price degression.
 */
export function calculateTokenPrice(quantity: number): number {
    const BASE_PRICE = 4.90;
    const DISCOUNT_FACTOR = 0.25;
    const MIN_PRICE = 1.50;

    const unitPrice = Math.max(
        MIN_PRICE,
        BASE_PRICE * (1 - Math.log10(Math.max(quantity, 10) / 10) * DISCOUNT_FACTOR)
    );
    return Math.round(unitPrice * quantity);
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export class PackageSystem {
    /**
     * Get limits for a package, merging DB overrides with static defaults.
     * Supports grandfathering: if oldPkg snapshot exists, takes the max of old/new for each field.
     */
    static async getLimits(pkg: string, oldPkgSnapshot?: string): Promise<PackageLimits> {
        const fallback = PACKAGE_LIMITS[pkg as PackageType] || PACKAGE_LIMITS.FREEMIUM;
        let limits = { ...fallback };

        // Merge DB dynamic overrides
        try {
            const dbPkg = await prisma.creditPackage.findFirst({
                where: { slug: pkg, billingPeriod: 1 }
            });
            if (dbPkg && (dbPkg as any).features && typeof (dbPkg as any).features === "object" && !Array.isArray((dbPkg as any).features)) {
                limits = { ...limits, ...((dbPkg as any).features as Record<string, any>) };
            }
        } catch (error) {
            console.error("Error fetching package limits from DB:", error);
        }

        // Grandfathering: take the better of old vs new for each field
        if (oldPkgSnapshot && oldPkgSnapshot !== pkg) {
            const oldLimits = PACKAGE_LIMITS[oldPkgSnapshot as PackageType];
            if (oldLimits) {
                // Numeric fields: take the max
                const numericKeys: (keyof PackageLimits)[] = [
                    "maxListings", "listingDays", "initialTokens", "monthlyTokens",
                    "softCap", "maxDailyOffers", "maxBoosts", "boostDays"
                ];
                for (const key of numericKeys) {
                    (limits as any)[key] = Math.max(
                        (limits as any)[key] as number,
                        (oldLimits as any)[key] as number
                    );
                }
                // Boolean fields: OR (if either allows it, keep it)
                const boolKeys: (keyof PackageLimits)[] = [
                    "phoneVisible", "featuredEligible", "priorityRanking",
                    "trustBoost", "identityVerificationEligible", "spotlightEligible",
                    "canCreatePoster", "aiGenerator"
                ];
                for (const key of boolKeys) {
                    (limits as any)[key] = (limits as any)[key] || (oldLimits as any)[key];
                }
                // watermark: false is better (no watermark)
                limits.watermark = limits.watermark && oldLimits.watermark;
                // posterQuality: take the higher
                const qualityOrder = { LOW: 0, NORMAL: 1, HIGH: 2 };
                const oldQ = qualityOrder[oldLimits.posterQuality] || 0;
                const newQ = qualityOrder[limits.posterQuality] || 0;
                limits.posterQuality = newQ >= oldQ ? limits.posterQuality : oldLimits.posterQuality;
            }
        }

        return limits;
    }

    static getDailyCaps(pkg: string): DailyCaps {
        return DAILY_CAPS[pkg as PackageType] || DAILY_CAPS.FREEMIUM;
    }

    static async canCreateListing(packageType: string, currentCount: number): Promise<boolean> {
        const limits = await this.getLimits(packageType);
        return currentCount < limits.maxListings;
    }

    static async getListingDuration(packageType: string): Promise<number> {
        const limits = await this.getLimits(packageType);
        return limits.listingDays;
    }

    static async isPhoneVisible(packageType: string): Promise<boolean> {
        const limits = await this.getLimits(packageType);
        return limits.phoneVisible;
    }

    static async isIdentityVerificationEligible(packageType: string): Promise<boolean> {
        const limits = await this.getLimits(packageType);
        return limits.identityVerificationEligible;
    }

    static async canBoost(packageType: string, currentBoostCount: number): Promise<boolean> {
        const limits = await this.getLimits(packageType);
        return limits.maxBoosts > 0 && currentBoostCount < limits.maxBoosts;
    }

    static async canSpotlight(packageType: string): Promise<boolean> {
        const limits = await this.getLimits(packageType);
        return limits.spotlightEligible;
    }

    static async calculateRenewalBalance(currentBalance: number, packageType: string): Promise<number> {
        const limits = await this.getLimits(packageType);
        return Math.min(currentBalance + limits.monthlyTokens, limits.softCap);
    }

    static async getPosterQuality(packageType: string): Promise<"LOW" | "NORMAL" | "HIGH"> {
        const limits = await this.getLimits(packageType);
        return limits.posterQuality;
    }

    static async canCreatePoster(packageType: string): Promise<boolean> {
        const limits = await this.getLimits(packageType);
        return limits.canCreatePoster;
    }
}

// â”€â”€ Boost Tier Access (per package) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type BoostTier = "BASIC" | "PREMIUM" | "ELITE";

export const BOOST_TIER_ACCESS: Record<PackageType, BoostTier[]> = {
    FREEMIUM: [],
    PREMIUM: ["BASIC"],
    PLUS: ["BASIC", "PREMIUM"],
    PRO: ["BASIC", "PREMIUM", "ELITE"],
    BUSINESS: ["BASIC", "PREMIUM"],
    BUSINESS_PLUS: ["BASIC", "PREMIUM", "ELITE"],
};

export function canAccessBoostTier(packageType: string, tier: BoostTier): boolean {
    const access = BOOST_TIER_ACCESS[packageType as PackageType] || [];
    return access.includes(tier);
}

// â”€â”€ Plan Prices (TRY, monthly) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const PLAN_PRICES_TRY: Record<PackageType, number> = {
    FREEMIUM: 0,
    PREMIUM: 199,
    PLUS: 399,
    PRO: 699,
    BUSINESS: 1299,
    BUSINESS_PLUS: 2499,
};

export const ANNUAL_DISCOUNT = 0.14;  // 14% off â†’ "2 ay hediye"
export const QUARTERLY_DISCOUNT = 0.07; // ~7% off for 3-month
export const FREEZE_MONTHLY_TRY = 99; // Paket dondurma fee

// â”€â”€ Token Expiry Rules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const TOKEN_EXPIRY_DAYS = {
    PURCHASED: 90,   // À la carte purchases
    PROMO: 30,   // Sign-up bonus / promotional grants
    SUBSCRIPTION: null, // Never expires (capped by soft cap)
} as const;

// â”€â”€ Subscription Rules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const DOWNGRADE_COOLDOWN_DAYS = 7;
export const BLAST_THRESHOLD_HOURS = 48;
export const BLAST_THRESHOLD_PCT = 0.80;

// â”€â”€ Plan Ordering (for upgrade/downgrade detection) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PLAN_ORDER: Record<string, number> = {
    FREEMIUM: 0, PREMIUM: 1, PLUS: 2, PRO: 3,
    BUSINESS: 10, BUSINESS_PLUS: 11,
};

export function isUpgrade(from: string, to: string): boolean {
    return (PLAN_ORDER[to] ?? 0) > (PLAN_ORDER[from] ?? 0);
}

export function isDowngrade(from: string, to: string): boolean {
    return (PLAN_ORDER[to] ?? 0) < (PLAN_ORDER[from] ?? 0);
}
