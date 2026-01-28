import { z } from "zod";

export const ProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      avatar: z.string().nullable(),
      createdAt: z.date(),
      generatedImages: z.array(
        z.object({
          id: z.string(),
          prompt: z.string(),
          likeCount: z.number(),
          remixCount: z.number(),
          createdAt: z.date(),
        }),
      ),
    })
    .optional(),
});

export type ProfileSchemaResponse = z.infer<typeof ProfileResponseSchema>;
