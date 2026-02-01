import { prisma } from "@/lib/prisma";
import { deleteCachedData, CacheKeys } from "@/lib/cache";

export async function toggleFollow(
  currentUserId: string,
  targetUserId: string,
  action: "follow" | "unfollow",
): Promise<{ success: boolean; message: string; isFollowing?: boolean }> {
  try {
    if (currentUserId === targetUserId) {
      return { success: false, message: "Cannot follow yourself" };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { success: false, message: "User not found" };
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (action === "follow") {
      if (existingFollow) {
        return { success: false, message: "Already following this user" };
      }

      await prisma.$transaction([
        prisma.follow.create({
          data: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        }),
        prisma.user.update({
          where: { id: targetUserId },
          data: { followerCount: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: currentUserId },
          data: { followingCount: { increment: 1 } },
        }),
      ]);

      await deleteCachedData(CacheKeys.user(currentUserId));
      await deleteCachedData(CacheKeys.user(targetUserId));

      return {
        success: true,
        message: "Successfully followed user",
        isFollowing: true,
      };
    } else {
      if (!existingFollow) {
        return { success: false, message: "Not following this user" };
      }

      await prisma.$transaction([
        prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: targetUserId,
            },
          },
        }),
        prisma.user.update({
          where: { id: targetUserId },
          data: { followerCount: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id: currentUserId },
          data: { followingCount: { decrement: 1 } },
        }),
      ]);

      await deleteCachedData(CacheKeys.user(currentUserId));
      await deleteCachedData(CacheKeys.user(targetUserId));

      return {
        success: true,
        message: "Successfully unfollowed user",
        isFollowing: false,
      };
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

export async function getFollowers(userId: string) {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            followerCount: true,
            followingCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return followers.map((f) => f.follower);
  } catch (error) {
    console.error("Error fetching followers:", error);
    return [];
  }
}

export async function getFollowing(userId: string) {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            followerCount: true,
            followingCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return following.map((f) => f.following);
  } catch (error) {
    console.error("Error fetching following:", error);
    return [];
  }
}
