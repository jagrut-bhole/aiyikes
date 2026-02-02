import { prisma } from "@/lib/prisma";
import { invalidateImageCache } from "./imageHelper";

export type LikeResult = {
    success: boolean;
    isLiked: boolean;
    likeCount: number;
    error?: string;
};

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
            newLikeCount = await prisma.$transaction(async (tx) => {
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

                return updatedImage.likeCount;
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
