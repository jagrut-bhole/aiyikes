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
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error getting the cache for key ${key}`, error);
    return null;
  }
}

// Set Cached Data with the TTL
export async function setCachedData(
  key: string,
  value: any,
  ttl: number = CACHE_TTL.USER,
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting cache for key ${key}: `, error);
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
