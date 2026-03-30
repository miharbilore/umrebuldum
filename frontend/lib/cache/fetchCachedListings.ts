import { redis } from "@/lib/redis";
import * as crypto from "crypto";
// import * as Sentry from "@sentry/nextjs";
const Sentry = {
  addBreadcrumb: (...args: any[]) => console.debug("[Sentry Mock Breadcrumb]", ...args),
};

// Anti-stampede: local node memory
const inFlightPromises = new Map<string, Promise<any>>();

/**
 * Advanced Redis Caching with Dual-Layer Lock (Memory + Distributed)
 */
export async function fetchCachedListings(
  rawQuery: string,
  dbCallback: () => Promise<any>,
  ttlSeconds = 300
): Promise<any> {
  // 1. Env Bypass
  if (process.env.DISABLE_CACHE === "true") {
    return dbCallback();
  }

  // 2. Compute Target Keys (SHA-1 to dodge memory limits)
  const hash = crypto.createHash("sha1").update(rawQuery).digest("hex");
  const cacheKey = `umre:cache:tour:list:${hash}`;
  const lockKey = `umre:lock:tour:list:${hash}`;

  if (process.env.NODE_ENV === "development") {
    console.debug(`[Cache] Checking ${cacheKey} mapped from: ${rawQuery}`);
  } else {
    // Audit breadcrumb in production, completely silent in standard logs
    Sentry.addBreadcrumb({
      category: "cache.request",
      message: `Hash miss/hit: ${hash}`,
      data: { rawQuery },
    });
  }

  // 3. Attempt Cache Read with Safe Parsing
  const checkCache = async () => {
    if (!redis) return null;
    try {
      const cached = await redis.get(cacheKey);
      if (typeof cached === "string") {
        return JSON.parse(cached); // try-catch wraps this implicitly inside outer try-catch
      }
      return cached; // if upstash returned object directly
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(`[Redis] Corrupt cache parsing for ${cacheKey}`, err);
      }
      // Never crash on JSON parse fail -> treat as miss
      return null;
    }
  };

  const initialHit = await checkCache();
  if (initialHit) return initialHit;

  // 4. Memory Lock Detection (Current Node Instance Dog-pile check)
  if (inFlightPromises.has(cacheKey)) {
    return inFlightPromises.get(cacheKey);
  }

  // 5. Distributed Lock Execution & DB Resolution
  const executeQuery = async () => {
    let acquiredLock = false;
    
    // Attempt Redis SETNX lock
    try {
      if (redis) acquiredLock = Boolean(await redis.set(lockKey, "1", { nx: true, ex: 3 }));
    } catch { /* Suppress redis faults */ }

    // If we missed the lock, someone else is fetching the database RIGHT NOW across the serverless fleet.
    if (!acquiredLock && redis) {
      const waitIntervals = [100, 200, 300]; // Incremental backoff max 600ms delays
      
      for (const delay of waitIntervals) {
        await new Promise((r) => setTimeout(r, delay));
        const delayedHit = await checkCache();
        if (delayedHit) return delayedHit; // Winner populated cache!
      }
    }
    
    // We are the winner (acquiredLock = true), or wait loop expired (fallback limit).
    // Execute Database Query ONCE securely.
    const freshData = await dbCallback();

    // Safe Cache Population
    try {
      if (redis) {
        // ALWAYS JSON.stringify defensively.
        await redis.setex(cacheKey, ttlSeconds, JSON.stringify(freshData));
      }
    } catch { /* Ignore write fails */ }

    return freshData;
  };

  const queryPromise = executeQuery();
  inFlightPromises.set(cacheKey, queryPromise);

  try {
    return await queryPromise;
  } finally {
    inFlightPromises.delete(cacheKey);
  }
}
