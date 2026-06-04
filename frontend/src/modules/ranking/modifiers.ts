import { RankingBoostInput, RankingListingInput, PersonalizationInput, QueryIntentInput, RankingGuideInput, RankedListing } from "./types";
import { clamp } from "./utils";
import { BOOST_TRUST_GATES, BOOST_CAP_RATIO, PERSONALIZATION_RANGE } from "./constants";

// ─── Boost Component ───────────────────────────────────────────────────────

export function computeBoostComponent(
    organicScore: number,
    boost: RankingBoostInput,
    trustScore: number,
): number {
    if (!boost.isActive || organicScore <= 0) return 0;

    // Trust gate: trust < 40 gets no boost at all
    if (trustScore < BOOST_TRUST_GATES.BASIC) return 0;

    // Tier trust gate enforcement
    const tier = boost.boostTier || "BASIC";
    if (tier === "PREMIUM" && trustScore < BOOST_TRUST_GATES.PREMIUM) return 0;
    if (tier === "ELITE" && trustScore < BOOST_TRUST_GATES.ELITE) return 0;

    // Diminishing returns: 1st = 100%, 2nd = 50%, 3rd = 33%
    const diminishing = 1 / boost.activeBoostCount;

    // Raw lift: effectivePower (0-1, already decayed) × 200 × diminishing
    const rawLift = boost.effectivePower * 200 * diminishing;

    // PERCENTAGE CAP: boost NEVER exceeds 20% of organic score
    const maxAllowed = organicScore * BOOST_CAP_RATIO;

    return Math.round(Math.min(rawLift, maxAllowed));
}

// ─── Personalization Adjustment ────────────────────────────────────────────

export function computePersonalization(
    listing: RankingListingInput,
    personalization: PersonalizationInput | null,
): number {
    if (!personalization || !personalization.userId) return 0;

    let adjust = 0;

    // Price range match (±40)
    if (personalization.preferredPriceMin !== undefined && personalization.preferredPriceMax !== undefined) {
        if (listing.price >= personalization.preferredPriceMin &&
            listing.price <= personalization.preferredPriceMax) {
            adjust += 40;
        } else {
            const mid = (personalization.preferredPriceMin + personalization.preferredPriceMax) / 2;
            const distance = mid > 0 ? Math.abs(listing.price - mid) / mid : 0;
            adjust -= Math.min(40, Math.round(distance * 40));
        }
    }

    // City preference (+20)
    if (personalization.searchedCities?.includes(listing.city)) {
        adjust += 20;
    }

    // Click history boost (+30)
    if (personalization.clickedListingIds?.includes(listing.id)) {
        adjust += 30;
    }

    // Ignore penalty (-30)
    if (personalization.ignoredListingIds?.includes(listing.id)) {
        adjust -= 30;
    }

    return clamp(adjust, -PERSONALIZATION_RANGE, PERSONALIZATION_RANGE);
}

// ─── Fill Rate Penalty ─────────────────────────────────────────────────────

export function computeFillPenalty(listing: RankingListingInput): number {
    if (listing.quota <= 0) return 0;
    const fillRatio = listing.filled / listing.quota;
    // Full listings (100%) get -100 point penalty, proportional
    return Math.round(-100 * fillRatio);
}

// ─── Priority Factors (Location & Date Proximity) ──────────────────────────

export function computeLocationPriority(
    listing: RankingListingInput,
    guide: RankingGuideInput,
    searchedCity: string | null
): number {
    if (!searchedCity) return 0;
    
    const city = searchedCity.toLowerCase().trim();
    let bonus = 0;

    // Highest Priority: Departure City matches search
    if (listing.departureCity?.toLowerCase().includes(city)) {
        bonus += 5000;
    }

    // Secondary Priority: Agency Headquarters matches search
    if (guide.agencyCity?.toLowerCase().includes(city)) {
        bonus += 2000;
    }

    // Tertiary Priority: Destination city match
    if (listing.city.toLowerCase().includes(city)) {
        bonus += 1000;
    }

    return bonus;
}

export function computeDateProximity(
    listing: RankingListingInput,
    searchDate: string | null
): number {
    if (!searchDate) return 0;

    const targetTime = new Date(searchDate).getTime();
    const startTime = listing.startDate.getTime();
    const endTime = listing.endDate.getTime();

    let bonus = 0;

    // 1. Direct Match: Current date is within tour range
    if (targetTime >= startTime && targetTime <= endTime) {
        bonus += 10000;
    }

    // 2. Proximity: Closer to start date is better (Max 3000 points)
    const dayDiff = Math.abs(targetTime - startTime) / (1000 * 60 * 60 * 24);
    
    // Decay: 100 points per day distance, up to 30 days
    const proximityScore = Math.max(0, 3000 - (dayDiff * 100));
    bonus += Math.round(proximityScore);

    return bonus;
}

// ─── Diversity Penalty ─────────────────────────────────────────────────────

export function applyDiversityPenalty(
    ranked: RankedListing[],
    getAgencyId: (listingId: string) => string,
): RankedListing[] {
    const agencyCounts = new Map<string, number>();

    return ranked.map(r => {
        const agencyId = getAgencyId(r.listingId);
        const count = (agencyCounts.get(agencyId) ?? 0) + 1;
        agencyCounts.set(agencyId, count);

        if (count === 3) {
            // 3rd listing: -10% score
            return { ...r, finalScore: Math.round(r.finalScore * 0.90) };
        } else if (count > 3) {
            // 4th+: -25% score
            return { ...r, finalScore: Math.round(r.finalScore * 0.75) };
        }

        return r;
    });
}

// ─── Query Intent Detector ─────────────────────────────────────────────────

export function detectQueryIntent(params: {
    sortBy?: string;
    priceMin?: number;
    priceMax?: number;
    city?: string;
    date?: string;
    ratingMin?: number;
}): QueryIntentInput {
    if (params.sortBy === "price") return { type: "PRICE_SENSITIVE" };
    if (params.ratingMin && params.ratingMin >= 4) return { type: "QUALITY_SEEKING" };
    if (params.date) return { type: "DATE_SPECIFIC", searchDate: params.date } as any;
    if (params.city) return { type: "LOCATION_SPECIFIC", searchedCity: params.city } as any;
    return { type: "BROWSE", searchedCity: params.city, searchDate: params.date } as any;
}
