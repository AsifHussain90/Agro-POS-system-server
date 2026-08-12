import { z } from 'zod';

const addressSchema = z
  .object({
    street: z.string().trim().max(150).optional().nullable(),
    city: z.string().trim().min(1).max(100),
    country: z.string().trim().min(1).max(100),
    zipCode: z.string().trim().max(20).optional().nullable(),
  })
  .strict();

const locationSchema = z
  .object({
    type: z.literal('Point'),
    address: addressSchema,
  })
  .strict();

const farmSizeSchema = z
  .object({
    value: z.number().positive(),
    unit: z.enum(['acres', 'hectares', 'sqft']),
  })
  .strict();

const cropSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    category: z.string().trim().min(1).max(50),
    season: z.string().trim().min(1).max(50),
    isOrganic: z.boolean().default(false),
  })
  .strict();

const farmImageSchema = z
  .object({
    url: z.string().trim().url(),
    caption: z.string().trim().max(200).optional(),
  })
  .strict();

export const createFarmerRequestSchema = z
  .object({
    farmName: z.string().trim().min(3).max(100),
    farmDescription: z.string().trim().min(10).max(1000),
    location: locationSchema,
    farmSize: farmSizeSchema,
    crops: z.array(cropSchema).min(1, 'At least one crop is required'),
    farmImages: z.array(farmImageSchema).optional().default([]),
  })
  .strict();

//NEW: Partial schema for updates — all fields optional
export const updateFarmerRequestSchema = createFarmerRequestSchema.partial().strict();