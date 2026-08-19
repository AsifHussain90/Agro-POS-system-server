import { z } from 'zod';

export const createBuyerProfileSchema = z.object({
  phone: z.string().trim().min(1, 'Phone is required'),
  alternatePhone: z.string().trim().optional().nullable(),
  cnic: z.string().trim().optional().nullable(),
  deliveryPreferences: z
    .object({
      type: z.enum(['home_delivery', 'farm_pickup']).optional(),
      timeSlot: z.enum(['morning', 'afternoon', 'evening']).optional(),
      instructions: z.string().trim().optional(),
    })
    .optional(),
  paymentPreference: z
    .enum(['cash_on_delivery', 'bank_transfer', 'jazzcash', 'easypaisa'])
    .optional(),
  businessDetails: z
    .object({
      name: z.string().trim().optional(),
      type: z.enum(['restaurant', 'retail', 'processing', 'other']).optional(),
      ntn: z.string().trim().optional(),
    })
    .optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms of service' }),
  }),
  freshnessPolicyAccepted: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the freshness and quality policy',
    }),
  }),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(1).optional(),
  street: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  isDefault: z.boolean().optional().default(false),
});