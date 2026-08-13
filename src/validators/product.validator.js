import { z } from 'zod';

export const createProductSchema = z
  .object({
    name: z.string().trim().min(3).max(150),
    description: z.string().trim().max(2000).optional().nullable(),
    price: z.number().min(0),
    quantity: z.number().int().min(0),
    category: z.string().trim().min(1).max(100),
    images: z.array(z.string().trim().url()).optional().default([]),
  })
  .strict();

// Partial schema for updates — all fields optional
export const updateProductSchema = createProductSchema.partial().strict();