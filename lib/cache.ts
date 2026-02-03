import { redis } from "./redis";

// Cache TTL
export const CACHE_TTL = {
  USER: 60 * 60, // => 1 Hour
  GALLEY: 60 * 5, // => 5 Minutes
  IMAGE: 60 * 30, // => 30 Minutes
  USER_IMAGES: 60 * 20, // => 20 Minutes
  USER_STATS: 60 * 30, // => 30 Minutes
} as const;

// Cache Keys Build
export const CacheKeys = {
  user: (userId: string) => `user: ${userId}`,
  userByEmail: (email: string) => `user:email: ${email}`,
  galleryFeed: () => `galleryFeed`,
  userImages: (userId: string) => `user: ${userId}: images`,
  userStats: (userId: string) => `user: ${userId}: stats`,
  image: (imageId: string) => `image: ${imageId}`,
  rateLimitGenerate: (userId: string) => `ratelimit: generate:${userId}`,
};

// Get Cached Data
export async function getCachedData<T>(key: string): Promise<T | null> {
  // Skip Redis if disabled
  if (process.env.REDIS_ENABLED === 'false') {
    return null;
  }

  try {
    // Add timeout to prevent Redis from blocking
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1000) // 1 second timeout
    );

    const dataPromise = redis.get(key).then(data => {
      if (!data) return null;
      return JSON.parse(data) as T;
    });

    const result = await Promise.race([dataPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error(`Error getting the cache for key ${key}`, error);
    return null; // Fail gracefully, don't block
  }
}

// Set Cached Data with the TTL
export async function setCachedData(
  key: string,
  value: any,
  ttl: number = CACHE_TTL.USER,
): Promise<void> {
  // Skip Redis if disabled
  if (process.env.REDIS_ENABLED === 'false') {
    return;
  }

  try {
    // Don't await - fire and forget to avoid blocking
    const timeoutPromise = new Promise<void>((resolve) =>
      setTimeout(() => resolve(), 1000)
    );

    const setPromise = redis.setex(key, ttl, JSON.stringify(value));

    await Promise.race([setPromise, timeoutPromise]);
  } catch (error) {
    console.error(`Error setting cache for key ${key}: `, error);
    // Don't throw, just log
  }
}

// Delete Cached Data
export async function deleteCachedData(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Error deleting cache for key ${key}: `, error);
  }
}

// Delete Multiple Cached Data
export async function deleteMultipleCachedData(keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Error deleting multiple cache for keys ${keys}: `, error);
  }
}

// rate limiting using counter increment
export async function rateLimitGenerate(
  userId: string,
  key: string,
  ttl: number = 3600,
): Promise<number> {
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, ttl);
    }
    return count;
  } catch (error) {
    console.error(`Error rate limiting for user ${userId}: `, error);
    return 0;
  }
}
