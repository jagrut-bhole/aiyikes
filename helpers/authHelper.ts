import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  CACHE_TTL,
  getCachedData,
  setCachedData,
  CacheKeys,
  deleteMultipleCachedData,
} from "@/lib/cache";

export type CachedUser = {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAuthenticatedUser(): Promise<CachedUser | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    const userEmail = session.user.email;

    const cacheKey = CacheKeys.userByEmail(userEmail);

    const cachedUser = await getCachedData<CachedUser>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    console.log(`Cache MISS for user: ${userEmail}`);
    console.log("Fetching from DB");

    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
    });

    if (!user) {
      return null;
    }

    await setCachedData(cacheKey, user, CACHE_TTL.USER);

    await setCachedData(CacheKeys.user(user.id), user, CACHE_TTL.USER);

    return user;
  } catch (error) {
    console.error(`Error getting authenticated user: ${error}`);
    return null;
  }
}

export async function invalidateUserCache(
  userId: string,
  userEmail: string,
): Promise<void> {
  const keysToDelete = [CacheKeys.user(userId)];

  if (userEmail) {
    keysToDelete.push(CacheKeys.userByEmail(userEmail));
  }

  await deleteMultipleCachedData(keysToDelete);
}
