import { z } from "zod";

export const followToggleSchema = z.object({
    targetUserId: z.string().uuid("Invalid user ID"),
    action: z.enum(["follow", "unfollow"]),
});

export type FollowToggleRequest = z.infer<typeof followToggleSchema>;

export interface FollowToggleResponse {
    success: boolean;
    message: string;
    isFollowing?: boolean;
}
