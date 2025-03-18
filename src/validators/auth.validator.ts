import { z } from "zod";

export const registerValidator = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
});

export const loginValidator = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});
