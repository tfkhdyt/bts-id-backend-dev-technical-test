import { z } from "zod";

export const createChecklistValidator = z.object({
  name: z.string().min(3),
});

export const createChecklistItemValidator = z.object({
  itemName: z.string().min(3),
});
