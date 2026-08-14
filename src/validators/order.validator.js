import { z } from 'zod';

const orderItemSchema = z
  .object({
    productId: z.string().trim().min(1),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })
  .strict();

export const createOrderSchema = z
  .object({
    products: z
      .array(orderItemSchema)
      .min(1, 'At least one product is required'),
  })
  .strict();

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(['pending', 'completed', 'cancelled']),
  })
  .strict();