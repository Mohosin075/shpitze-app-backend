import { z } from "zod";

const createPostZodSchema = z.object({
    body: z.object({
        employer: z.string({ required_error: 'Employer is required' }),
        provider: z.string({ required_error: 'Provider is required' }),
        bookingSystem: z.string({ required_error: 'Booking System is required' }),
        category: z.string({ required_error: 'Category is required' }),
        schedule: z.string({ required_error: 'Schedule is required' }),
        price: z
            .union([z.string().transform((val) => parseFloat(val)), z.number()])
            .refine((val:any) => !isNaN(val), { message: "Price must be a valid number." }),
        transactionId: z.string({ required_error: 'Transaction ID is required' })
    })
});

export const PostValidation = {
    createPostZodSchema
}