import { z } from "zod";

export const ImageSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    model: z.string().min(1, "Model is required"),
    isPublic: z.boolean().default(true),
    seed: z.number().optional(),
    remixCount: z.number().default(0),
    likeCount: z.number().default(0),
    isRemixed: z.boolean().default(false),
});

export type ImageSchemaRequest = z.infer<typeof ImageSchema>;