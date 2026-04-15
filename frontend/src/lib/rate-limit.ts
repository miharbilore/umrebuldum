import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

import { redis as redisInstance } from "./redis";

// Create a new ratelimiter, that allows X requests per windowsMs
let defaultRateLimiter: Ratelimit | null = null;

try {
    if (redisInstance) {
        // Default: 30 requests per minute
        defaultRateLimiter = new Ratelimit({
            redis: redisInstance,
            limiter: Ratelimit.slidingWindow(30, "60 s"),
            analytics: true,
            prefix: "@upstash/ratelimit",
        });
    }
} catch (e) {
    console.warn("Failed to initialize Upstash Ratelimit.", e);
}


/**
 * Core Upstash rate limit wrapper.
 * For isolated environments, it will allow all traffic if Upstash is not configured.
 */
export async function rateLimit(
    key: string,
    windowMs: number = 60_000,
    maxRequests: number = 30
): Promise<{ success: boolean; remaining: number }> {
    if (!defaultRateLimiter) {
        // In production, fail CLOSED — block requests when rate limiting is unavailable
        if (process.env.NODE_ENV === "production") {
            console.error("[RateLimit] Redis not configured in production! Blocking request.");
            return { success: false, remaining: 0 };
        }
        // In development, fail open to allow local testing without Redis
        return { success: true, remaining: maxRequests };
    }

    try {
        const result = await defaultRateLimiter.limit(key);
        return {
            success: result.success,
            remaining: result.remaining
        }
    } catch (e) {
        console.error("Rate limit check failed", e);
        // In production, fail CLOSED on Redis errors
        if (process.env.NODE_ENV === "production") {
            return { success: false, remaining: 0 };
        }
        return { success: true, remaining: 1 }
    }
}

// Export the singleton redis connection for use in specialized limiters (e.g., chat/auth)
export const redis = redisInstance;

