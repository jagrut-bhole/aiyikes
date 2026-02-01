import { prisma } from "@/lib/prisma";
import {
  getCachedData,
  setCachedData,
  CacheKeys,
  CACHE_TTL,
} from "@/lib/cache";

export type CachedImage = {
  id: string;
  s3Url: string;
  userId: string;
  prompt: string;
  likeCount: number;
  remixCount: number;
  createdAt: Date;
};

export async function getAllImages(): Promise<CachedImage[] | null> {
  try {
    const cacheKey = CacheKeys.image("all");
    const cachedImage = await getCachedData<CachedImage[]>(cacheKey);

    if (cachedImage) {
      return cachedImage;
    }

    console.log("Cache Miss for Image, so fetching from DB");

    const images = await prisma.image.findMany({
      where: {
        isShared: true,
      },
      select: {
        id: true,
        s3Url: true,
        userId: true,
        prompt: true,
        likeCount: true,
        remixCount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (images.length === 0) {
      return [];
    }

    await setCachedData(cacheKey, images, CACHE_TTL.IMAGE);

    return images;
  } catch (error) {
    console.error("Error fetching image details:", error);
    return null;
  }
}
