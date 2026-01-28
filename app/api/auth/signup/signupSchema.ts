import { z } from "zod";

export const signupSchemaRequest = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const signupSchemaResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      avatar: z.string().nullable().optional(),
      emailVerified: z.boolean().nullable().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
    .optional(),
});

export type SignupSchemaRequest = z.infer<typeof signupSchemaRequest>;
export type SignupSchemaResponse = z.infer<typeof signupSchemaResponse>;
