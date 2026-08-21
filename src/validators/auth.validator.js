import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

export const registerSchema = z.object({
  fullName: z.string().trim().min(3).max(50),
  email: z.string().trim().email(),
  password: passwordSchema,
  role: z.enum(['user', 'farmer', 'buyer']).optional().default('user'),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: passwordSchema,
});

export const superAdminRegisterSchema = z.object({
  fullName: z.string().trim().min(3).max(50),
  email: z.string().trim().email(),
  password: passwordSchema,
  secretKey: z.string().min(1, 'Secret key is required'),
});