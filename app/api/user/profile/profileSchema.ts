import { z } from "zod";

export const ProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
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
          s3Url: z.string(),
          seed: z.number(),
        }),
      ),
    })
    .optional(),
});

export type ProfileSchemaResponse = z.infer<typeof ProfileResponseSchema>;
