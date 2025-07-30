import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'First name is required' }),
    lastName: z.string({ required_error: 'Last name is required' }),
    contact: z.string({ required_error: 'Contact is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    address: z.string().optional(),
    image: z.string().optional(),
  }),
});

const createEmployerZodSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'First name is required' }),
    lastName: z.string({ required_error: 'Last name is required' }),
    contact: z.string({ required_error: "'Contact is required'" }),
    address: z.string().optional(),
    certification: z.string().optional(),
    degree: z.string().optional(),
    institution: z.string().optional(),
    yearOfCompletion: z.string().optional(),
    specializations: z.string().optional(),
    skills: z.string().optional(),
    rating: z.number().min(0).default(0),
  }),
});

const updateLocationZodSchema = z.object({
  body: z.object({
    longitude: z.string({ required_error: 'Longitude is required' }),
    latitude: z.string({ required_error: 'Latitude is required' })
  }),
});

export const UserValidation = {
  createUserZodSchema,
  createEmployerZodSchema,
  updateLocationZodSchema
};
