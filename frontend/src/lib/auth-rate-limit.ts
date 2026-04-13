/**
 * Auth Rate Limiter
 * Provides strict Bruteforce protection for Login/Register endpoints using Upstash Redis.
 */
import { redis } from "./rate-limit";

const IP_MAX_FAILS = 5;
const IP_LOCKOUT_TTL = 15 * 60; // 15 mins in seconds

const EMAIL_MAX_FAILS = 10;
const EMAIL_BASE_LOCKOUT_TTL = 5 * 60; // 5 mins in seconds

export const AuthRateLimit = {
    /**
     * Checks if the current IP or Email is locked out.
     */
    checkLockout: async (ip: string, email?: string): Promise<{ allowed: boolean; reason?: string }> => {
        if (!redis) {
            return { allowed: true }; // Allow if Redis not configured
        }

        try {
            // 1. Check IP Lockout
            const ipKey = `auth:lockout:ip:${ip}`;
            const isIpLocked = await redis.exists(ipKey);
            if (isIpLocked) {
                return { allowed: false, reason: "Too many login attempts. Please try again in 15 minutes." };
            }

            // 2. Check Email Lockout (Progressive Backoff)
            if (email) {
                const normalizedEmail = email.toLowerCase();
                const emailKey = `auth:lockout:email:${normalizedEmail}`;
                const isEmailLocked = await redis.exists(emailKey);
                if (isEmailLocked) {
                    return { allowed: false, reason: "Account locked due to multiple failed attempts. Try again later." };
                }
            }

            return { allowed: true };
        } catch (e) {
            console.error("AuthRateLimit checkLockout error", e);
            return { allowed: true }; // Fail open
        }
    },

    /**
     * Registers a failed attempt and triggers lockout if thresholds are exceeded.
     */
    recordFailure: async (ip: string, email?: string) => {
        if (!redis) return;

        try {
            // 1. IP Tracking
            const ipFailKey = `auth:fails:ip:${ip}`;
            const ipFailCount = await redis.incr(ipFailKey);
            
            // Set expire on first fail (15m sliding window for failures)
            if (ipFailCount === 1) {
                 await redis.expire(ipFailKey, 15 * 60);
            }

            if (ipFailCount >= IP_MAX_FAILS) {
                const ipLockKey = `auth:lockout:ip:${ip}`;
                await redis.set(ipLockKey, "LOCKED", { ex: IP_LOCKOUT_TTL });
                await redis.del(ipFailKey); // Reset count upon lock
            }

            // 2. Email Tracking
            if (email) {
                const normalizedEmail = email.toLowerCase();
                const emailFailKey = `auth:fails:email:${normalizedEmail}`;
                const emailFailCount = await redis.incr(emailFailKey);

                if (emailFailCount === 1) {
                     await redis.expire(emailFailKey, EMAIL_BASE_LOCKOUT_TTL);
                }

                if (emailFailCount >= EMAIL_MAX_FAILS) {
                    // Progressive backoff
                    const multiplier = emailFailCount - EMAIL_MAX_FAILS + 1;
                    const emailLockKey = `auth:lockout:email:${normalizedEmail}`;
                    await redis.set(emailLockKey, "LOCKED", { ex: EMAIL_BASE_LOCKOUT_TTL * multiplier });
                }
            }
        } catch (e) {
            console.error("AuthRateLimit recordFailure error", e);
        }
    },

    /**
     * Clears tracking for a successful login.
     */
    recordSuccess: async (ip: string, email?: string) => {
         if (!redis) return;
         try {
             await redis.del(`auth:fails:ip:${ip}`);
             if (email) {
                  await redis.del(`auth:fails:email:${email.toLowerCase()}`);
             }
         } catch(e) {
              console.error("AuthRateLimit recordSuccess error", e);
         }
    }
};
