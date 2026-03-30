import { Redis } from "@upstash/redis";

let redisInstance: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    console.warn("UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN are missing. Redis cache will be disabled.");
  }
} catch (e) {
  console.warn("Failed to initialize Upstash Redis.", e);
}

export const redis = redisInstance;
