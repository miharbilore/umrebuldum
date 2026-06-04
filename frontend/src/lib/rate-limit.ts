import { Ratelimit } from "@upstash/ratelimit";
import { redis as redisInstance } from "./redis";

// Action tiplerine göre esnek limit tanımlamaları
export type ActionType = "API_GENERAL" | "OFFER_SEND" | "CLAIM_BONUS" | "ONBOARDING";

type ActionConfig = {
    limit: number;
    window: `${number} s` | `${number} m` | `${number} h`;
};

const ACTION_LIMITS: Record<ActionType, ActionConfig> = {
    API_GENERAL: { limit: 10, window: "10 s" },
    OFFER_SEND: { limit: 1, window: "10 s" },
    CLAIM_BONUS: { limit: 2, window: "60 s" },
    ONBOARDING: { limit: 3, window: "60 s" },
};

// Limiter cache (Her ActionType için ayrı Ratelimit instance'ını önbelleğe alır)
const limiters = new Map<ActionType, Ratelimit>();

function getLimiter(actionType: ActionType): Ratelimit | null {
    if (!redisInstance) return null;

    if (!limiters.has(actionType)) {
        const config = ACTION_LIMITS[actionType];
        const limiter = new Ratelimit({
            redis: redisInstance,
            limiter: Ratelimit.slidingWindow(config.limit, config.window),
            analytics: true,
            prefix: `@upstash/ratelimit:${actionType.toLowerCase()}`,
        });
        limiters.set(actionType, limiter);
    }
    return limiters.get(actionType)!;
}

/**
 * Global Merkezi Rate Limiter
 * 
 * @param ipAddress İsteği yapan kullanıcının IP adresi
 * @param actionType Yapılan işlemin türü (API_GENERAL, OFFER_SEND vs.)
 */
export async function checkRateLimit(
    ipAddress: string,
    actionType: ActionType = "API_GENERAL"
): Promise<{ success: boolean; remaining: number }> {
    const limiter = getLimiter(actionType);

    if (!limiter) {
        // Prod ortamda Redis yoksa güvenli kalmak için istekleri reddet (Fail Closed)
        if (process.env.NODE_ENV === "production") {
            console.error(`[RateLimit] Redis not configured in production! Blocking request for ${actionType}.`);
            return { success: false, remaining: 0 };
        }
        // Geliştirme ortamında (Dev) esneklik için izin ver (Fail Open)
        return { success: true, remaining: 100 };
    }

    try {
        const result = await limiter.limit(`ip:${ipAddress}`);
        return {
            success: result.success,
            remaining: result.remaining
        };
    } catch (e) {
        console.error(`Rate limit check failed for ${actionType}`, e);
        if (process.env.NODE_ENV === "production") {
            return { success: false, remaining: 0 };
        }
        return { success: true, remaining: 1 };
    }
}

// Eski (Legacy) kullanımlar için geriye dönük uyumluluk wrapper'ı
export async function rateLimit(key: string, windowMs = 60_000, maxRequests = 30) {
    return checkRateLimit(key, "API_GENERAL");
}

export const redis = redisInstance;
