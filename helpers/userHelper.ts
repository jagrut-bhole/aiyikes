import { prisma } from "@/lib/prisma";
import { deleteCachedData, CacheKeys } from "@/lib/cache";

export async function updateUserAvatar(
    userId: string,
    avatarUrl: string
): Promise<boolean> {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
        });

        await deleteCachedData(CacheKeys.user(userId));

        return true;
    } catch (error) {
        console.error("Error updating user avatar:", error);
        return false;
    }
}

export async function getUserById(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                followerCount: true,
                followingCount: true,
                createdAt: true,
            },
        });

        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}
