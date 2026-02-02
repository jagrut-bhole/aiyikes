import { z } from "zod";

export const RemixImageSchema = z.object({
    originalImageId: z.string().uuid(),
    remixPrompt: z.string().min(1).max(1000),
});

export type RemixImageSchemaType = z.infer<typeof RemixImageSchema>;
