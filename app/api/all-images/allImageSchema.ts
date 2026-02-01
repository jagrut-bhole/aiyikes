import { z } from 'zod';

export const allImageSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(z.object({
    id: z.string(),
    prompt: z.string(),
    s3Url: z.string(),
    model: z.string(),
    seed: z.number(),
    isPublic: z.boolean(),
    likeCount: z.number(),
    remixCount: z.number(),
    createdAt: z.date(),
  })).optional()
})

export type AllImageSchemaResponse = z.infer<typeof allImageSchema>;