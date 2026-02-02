import { prisma } from "@/lib/prisma";
import { invalidateImageCache } from "./imageHelper";

export type LikeResult = {
    success: boolean;
    isLiked: boolean;
    likeCount: number;
    error?: string;
};

/**
 * Toggle like on an image
 * - Creates a like if it doesn't exist
 * - Deletes the like if it already exists
 * - Updates the likeCount on the Image
 * - Invalidates Redis cache for the image
 */
export async function toggleImageLike(
    userId: string,
    imageId: string
): Promise<LikeResult> {
    try {
        const existingLike = await prisma.imageLike.findUnique({
            where: {
                userId_imageId: {
                    userId,
                    imageId,
                },
            },
        });

        let isLiked: boolean;
        let newLikeCount: number;

        if (existingLike) {
            newLikeCount = await prisma.$transaction(async (tx) => {
                await tx.imageLike.delete({
                    where: {
                        id: existingLike.id,
                    },
                });

                const updatedImage = await tx.image.update({
                    where: { id: imageId },
                    data: {
                        likeCount: {
                            decrement: 1,
                        },
                    },
                    select: {
                        likeCount: true,
                    },
                });

                return updatedImage.likeCount;
            });

            isLiked = false;
        } else {
            await prisma.$transaction(async (tx) => {
                await tx.imageLike.create({
                    data: {
                        userId,
                        imageId,
                    },
                });

                const updatedImage = await tx.image.update({
                    where: { id: imageId },
                    data: {
                        likeCount: {
                            increment: 1,
                        },
                    },
                    select: {
                        likeCount: true,
                    },
                });

                newLikeCount = updatedImage.likeCount;
            });

            isLiked = true;
        }

        await invalidateImageCache(imageId);

        return {
            success: true,
            isLiked,
            likeCount: newLikeCount,
        };
    } catch (error) {
        console.error("Error toggling image like:", error);
        return {
            success: false,
            isLiked: false,
            likeCount: 0,
            error: "Failed to toggle like",
        };
    }
}

/**
 * Check if a user has liked a specific image
 */
export async function hasUserLikedImage(
    userId: string,
    imageId: string
): Promise<boolean> {
    try {
        const like = await prisma.imageLike.findUnique({
            where: {
                userId_imageId: {
                    userId,
                    imageId,
                },
            },
        });

        return !!like;
    } catch (error) {
        console.error("Error checking if user liked image:", error);
        return false;
    }
}

/**
 * Get all images liked by a user
 */
export async function getUserLikedImages(userId: string) {
    try {
        const likedImages = await prisma.imageLike.findMany({
            where: {
                userId,
            },
            include: {
                image: {
                    select: {
                        id: true,
                        prompt: true,
                        s3Url: true,
                        model: true,
                        seed: true,
                        isPublic: true,
                        likeCount: true,
                        remixCount: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return likedImages.map((like) => like.image);
    } catch (error) {
        console.error("Error fetching user liked images:", error);
        return [];
    }
}
