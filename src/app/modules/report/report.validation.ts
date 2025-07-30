import { z } from 'zod';
import { Types } from 'mongoose';

export const reportSchema = z.object({
  body: z.object({
    provider: z.string(),
    type: z.enum(['Payment Report', 'Cancel Booking']),
    details: z.string(),
  }),
});

export const ReportValidation = {
  reportSchema,
};
