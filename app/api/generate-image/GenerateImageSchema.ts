import { z } from "zod";

export const GenerateImageRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string().optional().default("flux"),
  isPublic: z.boolean().default(true),
  width: z.number().optional().default(1024),
  height: z.number().optional().default(1024),
  seed: z.number().optional(),
});

export type GenerateImageRequest = z.infer<typeof GenerateImageRequestSchema>;

export const GenerateImageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  imageUrl: z.string().optional(),
  imageId: z.string().optional(),
});

export type GenerateImageResponse = z.infer<typeof GenerateImageResponseSchema>;
