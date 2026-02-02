import { z } from "zod";

export const checkFollowRequest = z.object({
  targetUserId: z.string(),
});

export type CheckFollowRequest = z.infer<typeof checkFollowRequest>;

export const checkFollowResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  isFollowing: z.boolean().optional(),
});

export type CheckFollowResponse = z.infer<typeof checkFollowResponse>;
