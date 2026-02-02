import { z } from "zod";

export const imageLikeSchema = z.object({
    imageId: z.string(),
});

export type ImageLikeRequest = z.infer<typeof imageLikeSchema>;
