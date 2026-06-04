export const SCALE = 1000;

export const WEIGHTS = {
    quality: 0.30,
    trust: 0.25,
    reviewQuality: 0.17,
    sla: 0.10,
    activity: 0.08,
    freshness: 0.10,
} as const;

// Boost HARD percentage cap — can NEVER exceed 18% of organic score
export const BOOST_CAP_RATIO = 0.18;

// Boost tier trust gates
export const BOOST_TRUST_GATES = {
    BASIC: 40,
    PREMIUM: 60,
    ELITE: 75,
} as const;

// Cold-start configuration
export const COLD_START_DAYS = 14;
export const COLD_START_BONUS = 0.40; // Added to freshness (capped at 1.0)

// Personalization range (±100 points on 1000-point scale)
export const PERSONALIZATION_RANGE = 100;

// EMA smoothing factor
export const EMA_ALPHA = 0.3;

// Query intent weight modifiers
export const INTENT_MODIFIERS: Record<string, {
    quality: number; trust: number; freshness: number; personalization: number;
}> = {
    BROWSE: { quality: 1.0, trust: 1.0, freshness: 1.2, personalization: 1.0 },
    PRICE_SENSITIVE: { quality: 0.8, trust: 0.7, freshness: 1.0, personalization: 1.3 },
    QUALITY_SEEKING: { quality: 1.3, trust: 1.5, freshness: 0.8, personalization: 0.8 },
    DATE_SPECIFIC: { quality: 1.0, trust: 1.0, freshness: 1.5, personalization: 1.0 },
    LOCATION_SPECIFIC: { quality: 1.0, trust: 1.0, freshness: 1.0, personalization: 1.5 },
};
