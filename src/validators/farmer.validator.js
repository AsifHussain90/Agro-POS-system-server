import { z } from "zod";

const addressSchema = z.object({
  street: z.string().trim().optional().nullable(),
  city: z.string().trim().min(1, { message: "City is required" }),
  state: z.string().trim().min(1, { message: "State is required" }),
  country: z.string().trim().default("Pakistan"),
  zipCode: z.string().trim().optional().nullable(),
});

const locationSchema = z.object({
  type: z.enum(["Point"]).default("Point"),
  address: addressSchema,
});

const cropSchema = z.object({
  name: z.string().trim().min(2).max(50),
  category: z.enum(["vegetable", "fruit", "grain", "pulse", "other"]),
  season: z.enum(["kharif", "rabi", "zaid", "year-round"]),
  isOrganic: z.boolean().optional().default(false),
});

const certificationSchema = z.object({
  name: z.string().trim().min(1),
  issuedBy: z.string().trim().optional().nullable(),
  issuedDate: z
    .preprocess((value) => {
      if (!value) return undefined;
      return value instanceof Date ? value : new Date(value);
    }, z.date().optional())
    .optional(),
  expiryDate: z
    .preprocess((value) => {
      if (!value) return undefined;
      return value instanceof Date ? value : new Date(value);
    }, z.date().optional())
    .optional(),
  certificateNumber: z.string().trim().optional().nullable(),
  documentUrl: z.string().trim().url().optional().nullable(),
});

export const createFarmerSchema = z
  .object({
    farmName: z
      .string()
      .trim()
      .min(3, { message: "Farm name must be at least 3 characters" })
      .max(100, { message: "Farm name cannot exceed 100 characters" }),
    farmDescription: z.string().trim().max(1000).optional().nullable(),
    location: locationSchema,
    farmSize: z.object({
      value: z.coerce
        .number({ invalid_type_error: "Farm size must be a valid number" })
        .positive({ message: "Farm size value must be positive" }),
      unit: z.enum(["acres", "hectares", "sqft"]).default("acres"),
    }),
    crops: z.array(cropSchema).max(20).optional(),
    certifications: z.array(certificationSchema).max(10).optional(),
    farmImages: z
      .array(
        z.object({
          url: z
            .string()
            .trim()
            .url({ message: "Farm image url must be valid" }),
          caption: z.string().trim().max(200).optional().nullable(),
        }),
      )
      .max(10)
      .optional(),
  })
  .strict();

export const updateFarmerSchema = createFarmerSchema.partial().strict();

export const farmerQuerySchema = z
  .object({
    city: z.string().trim().optional(),
    crop: z.string().trim().optional(),
    isOrganic: z.coerce.boolean().optional(),
    isVerified: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z
      .enum(["createdAt", "profileCompletion", "farmName"])
      .default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().trim().optional(),
  })
  .strict();
