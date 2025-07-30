import { z } from 'zod';

const createServiceListSchema = z.object({
  body: z.object({
    provider: z.string(),
    subCategory: z.string(),
    rate: z.string(),
    available: z.string(),
    category: z.string(),
    bookingSystem: z.enum(['instant_booking', 'request_booking']),
    rating: z.number().min(0).max(5).optional().default(0).optional(),
    totalRating: z.number().min(0).optional().default(0).optional(),
    status: z.enum(['active', 'delete']).optional().default('active'),
  }),
});


export const ServiceListValidationZodSchema = {
  createServiceListSchema,
};
