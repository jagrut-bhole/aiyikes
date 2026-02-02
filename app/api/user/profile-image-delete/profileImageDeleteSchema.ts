import { z } from "zod";

export const profileImageDeleteReqSchema = z.object({
    id: z.string(),
});

export type ProfileImageDeleteRequest = z.infer<typeof profileImageDeleteReqSchema>;

export const profileImageDeleteResSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export type ProfileImageDeleteResponse = z.infer<typeof profileImageDeleteResSchema>;