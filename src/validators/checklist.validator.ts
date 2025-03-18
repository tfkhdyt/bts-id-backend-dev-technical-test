import { z } from "zod";

export const createChecklistValidator = z.object({
  name: z.string().min(3),
});
