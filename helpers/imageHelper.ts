import { prisma } from "@/lib/prisma";
import {
  getCachedData,
  setCachedData,
  CacheKeys,
  CACHE_TTL,
  deleteCachedData,
} from "@/lib/cache";

/**
 * Type definition for a cached image
 */
type CachedImage = {
  id: string;
  prompt: string;
  s3Url: string;
  model: string;
  seed: number;
  userId: string;
  isPublic: boolean;
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
        isPublic: true,
      },
      select: {
        id: true,
        prompt: true,
        s3Url: true,
        model: true,
        seed: true,
        userId: true,
        isPublic: true,
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

export async function getAllImagesWithCreator(currentUserId?: string) {
  try {
    const images = await prisma.image.findMany({
      where: {
        isPublic: true,
      },
      select: {
        id: true,
        prompt: true,
        s3Url: true,
        pollinationUrl: true,
        model: true,
        seed: true,
        userId: true,
        isPublic: true,
        likeCount: true,
        remixCount: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: currentUserId
          ? {
            where: {
              userId: currentUserId,
            },
            select: {
              id: true,
            },
          }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return images.map((img) => ({
      id: img.id,
      prompt: img.prompt,
      s3Url: img.s3Url,
      pollinationUrl: img.pollinationUrl,
      model: img.model,
      seed: img.seed,
      isPublic: img.isPublic,
      likeCount: img.likeCount,
      remixCount: img.remixCount,
      createdAt: img.createdAt,
      user: img.user,
      isLiked: currentUserId ? (img.likes && img.likes.length > 0) : false,
    }));
  } catch (error) {
    console.error("Error fetching images with creator:", error);
    return null;
  }
}

export async function getImageById(imageId: string): Promise<CachedImage | null> {
  try {
    const cacheKey = CacheKeys.image(imageId);
    const cachedImage = await getCachedData<CachedImage>(cacheKey);

    if (cachedImage) {
      return cachedImage;
    }

    console.log("Cache Miss for Image ID, so fetching from DB");

    const image = await prisma.image.findUnique({
      where: {
        id: imageId,
      },
      select: {
        id: true,
        prompt: true,
        s3Url: true,
        model: true,
        seed: true,
        userId: true,
        isPublic: true,
        likeCount: true,
        remixCount: true,
        createdAt: true,
      },
    });

    if (!image) {
      return null;
    }

    await setCachedData(cacheKey, image, CACHE_TTL.IMAGE);

    return image;
  } catch (error) {
    console.error("Error fetching image details:", error);
    return null;
  }
}

export async function invalidateImageCache(imageId: string): Promise<void> {
  try {
    await deleteCachedData(CacheKeys.image(imageId));
    await deleteCachedData(CacheKeys.image("all"));
    await deleteCachedData(CacheKeys.galleryFeed());
    console.log(`Cache invalidated for image: ${imageId}`);
  } catch (error) {
    console.error(`Error invalidating cache for image ${imageId}:`, error);
  }
}

export async function incrementRemixCount(imageId: string): Promise<boolean> {
  try {
    await prisma.image.update({
      where: { id: imageId },
      data: {
        remixCount: {
          increment: 1,
        },
      },
    });

    await invalidateImageCache(imageId);

    return true;
  } catch (error) {
    console.error("Error incrementing remix count:", error);
    return false;
  }
}