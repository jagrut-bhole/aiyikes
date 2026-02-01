import { z } from "zod";

const updateFollowerRequest = z.object({
  userId: z.string(),
  action: z.enum(["follow", "unfollow"]),
});

export type UpdateFollowerRequest = z.infer<typeof updateFollowerRequest>;

const updateFollowerResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      isFollowing: z.boolean().optional(),
    })
    .optional(),
});

export type UpdateFollowerResponse = z.infer<typeof updateFollowerResponse>;
