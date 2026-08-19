import { z } from 'zod';

export const createAdminSchema = z.object({
  fullName: z.string().trim().min(3).max(50),
  email: z.string().trim().email(),
});