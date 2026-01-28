import { z } from "zod";

export const deleteAccountRequest = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const deleteAccountResponse = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type DeleteAccountRequest = z.infer<typeof deleteAccountRequest>;
export type DeleteAccountResponse = z.infer<typeof deleteAccountResponse>;
