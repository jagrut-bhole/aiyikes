import { z } from "zod";

const changePasswordRequest = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const changePasswordResponse = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ChangePasswordRequest = z.infer<typeof changePasswordRequest>;
export type ChangePasswordResponse = z.infer<typeof changePasswordResponse>;
