// ─── Deterministic Ranking Engine v3 ─────────────────────────────────────────
// Facade over the smaller refactored modules to ensure backward compatibility.
// Do not change exported names to prevent breaking dependent modules.

import type { ConversionMetrics } from "./conversion-tracker";
import {
    RankingListingInput,
    RankingGuideInput,
    RankingBoostInput,
    PersonalizationInput,
    QueryIntentInput,
    ScoringResult,
    RankedListing
} from "./types";
import { WEIGHTS, SCALE, INTENT_MODIFIERS } from "./constants";
import { smoothScore } from "./utils";
import {
    computeQuality,
    computeTrust,
    computeReviewQuality,
    computeSLA,
    computeActivity,
    computeFreshness
} from "./factors";
import {
    computeBoostComponent,
    computePersonalization,
    computeFillPenalty,
    computeLocationPriority,
    computeDateProximity,
    applyDiversityPenalty,
    detectQueryIntent
} from "./modifiers";

// Re-export all types so importers don't break
export type {
    RankingListingInput,
    RankingGuideInput,
    RankingBoostInput,
    PersonalizationInput,
    QueryIntentInput,
    ScoringResult,
    RankedListing
};

// Also export individual components in case someone needs them
export {
    applyDiversityPenalty,
    detectQueryIntent,
    smoothScore
};

// ─── Composite Scorer ────────────────────────────────────────────────────────

/**
 * Compute final ranking score for a single listing.
 * This is the core formula — pure function, O(1).
 *
 * FinalScore = OrganicScore + BoostComponent + Personalization + FillPenalty
 */
export function scoreListing(
    listing: RankingListingInput,
    guide: RankingGuideInput,
    boost: RankingBoostInput,
    conversion: ConversionMetrics | null,
    personalization: PersonalizationInput | null,
    intent: QueryIntentInput = { type: "BROWSE" },
): ScoringResult {
    // Compute each factor (all 0.0 – 1.0)
    const quality = computeQuality(guide, conversion);
    const trust = computeTrust(guide);
    const review = computeReviewQuality(guide, listing);
    const sla = computeSLA(guide);
    const activity = computeActivity(guide);
    const freshness = computeFreshness(listing, guide);

    // Apply query intent modifiers
    const mods = INTENT_MODIFIERS[intent.type] || INTENT_MODIFIERS.BROWSE;

    // Weighted organic score (0–1000 scale)
    const organicScore = Math.round(
        (quality * WEIGHTS.quality * mods.quality +
            trust * WEIGHTS.trust * mods.trust +
            review * WEIGHTS.reviewQuality +
            sla * WEIGHTS.sla +
            activity * WEIGHTS.activity +
            freshness * WEIGHTS.freshness * mods.freshness) * SCALE,
    );

    // Boost: percentage-capped, trust-gated
    const boostComponent = computeBoostComponent(organicScore, boost, guide.trustScore);

    // Personalization: ±100
    const personalizationAdjust = Math.round(
        computePersonalization(listing, personalization) * (mods.personalization ?? 1),
    );

    // Fill rate penalty
    const fillPenalty = computeFillPenalty(listing);

    // Priority Bonuses (Explicit Search Matches)
    const locationBonus = intent.type === "LOCATION_SPECIFIC" || intent.type === "BROWSE" 
        ? computeLocationPriority(listing, guide, (intent as any).searchedCity || null)
        : 0;
    
    const dateBonus = intent.type === "DATE_SPECIFIC" || intent.type === "BROWSE"
        ? computeDateProximity(listing, (intent as any).searchDate || null)
        : 0;

    const priorityBonus = locationBonus + dateBonus;

    // Final composite
    const finalScore = Math.max(0, organicScore + boostComponent + personalizationAdjust + fillPenalty + priorityBonus);

    return {
        listingId: listing.id,
        finalScore,
        organicScore,
        boostComponent,
        qualityScore: Math.round(quality * WEIGHTS.quality * SCALE),
        trustScore: Math.round(trust * WEIGHTS.trust * SCALE),
        reviewQualityScore: Math.round(review * WEIGHTS.reviewQuality * SCALE),
        slaScore: Math.round(sla * WEIGHTS.sla * SCALE),
        activityScore: Math.round(activity * WEIGHTS.activity * SCALE),
        freshnessScore: Math.round(freshness * WEIGHTS.freshness * SCALE),
        personalizationAdjust,
        fillPenalty,
        priorityBonus,
        breakdown: `Q:${Math.round(quality * 100)}|T:${Math.round(trust * 100)}|R:${Math.round(review * 100)}|S:${Math.round(sla * 100)}|A:${Math.round(activity * 100)}|F:${Math.round(freshness * 100)}|PB:${priorityBonus}→Org:${organicScore}+B:${boostComponent}+P:${personalizationAdjust}+FP:${fillPenalty}=${finalScore}`,
    };
}

// ─── Batch Ranker ────────────────────────────────────────────────────────────

/**
 * Score and sort a batch of listings.
 * Applies EMA smoothing if previous scores are provided.
 * Deterministic tiebreaker: newer listings first among equal scores.
 */
export function rankListings(
    results: ScoringResult[],
    previousScores?: Map<string, number>,
): RankedListing[] {
    // Apply EMA smoothing
    const smoothed = results.map(r => ({
        ...r,
        finalScore: smoothScore(r.finalScore, previousScores?.get(r.listingId) ?? null),
    }));

    // Sort descending by final score, tiebreaker: newer listing first
    smoothed.sort((a, b) => {
        if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
        // Deterministic tiebreaker: listingId (stable sort)
        return a.listingId.localeCompare(b.listingId);
    });

    // Assign positions
    return smoothed.map((r, idx) => ({ ...r, position: idx + 1 }));
}
