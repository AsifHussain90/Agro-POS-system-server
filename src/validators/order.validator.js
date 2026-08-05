import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  products: z.array(orderItemSchema).min(1),
});
