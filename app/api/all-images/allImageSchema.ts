import { z } from "zod";

export const allImageSchemaResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
        id: z.string(),
        s3Url: z.string(),
        userId: z.string(),
        prompt: z.string(),
        likeCount: z.number(),
        remixCount: z.number(),
        createdAt: z.date(),
    }).array().optional()
})

export type AllImageSchemaResponse = z.infer<typeof allImageSchemaResponse>;