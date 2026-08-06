import { z } from "zod";

export const createFarmerRequestSchema = z
  .object({
    farmName: z.string().trim().min(3).max(100),
    phone: z.string().trim().min(6).max(20),
    address: z.string().trim().min(5).max(300),
    description: z.string().trim().min(10).max(1000),
    documents: z
      .array(
        z.object({ name: z.string().trim(), url: z.string().trim().url() }),
      )
      .optional(),
  })
  .strict();

export const updateFarmerRequestSchema = createFarmerRequestSchema
  .partial()
  .strict();

export const reviewFarmerRequestSchema = z
  .object({
    reviewMessage: z.string().trim().max(500).optional(),
  })
  .strict();
