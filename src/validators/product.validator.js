import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(3).max(150),
  description: z.string().trim().max(2000).optional(),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  category: z.string().trim().min(1).max(100),
  images: z.array(z.string().url()).max(50).optional(),
});

export const updateProductSchema = createProductSchema.partial();
