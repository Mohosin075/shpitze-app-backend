import { z } from 'zod';

const createCategory = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .min(4, { message: 'Category name should be at least 4 characters' }),
  }),
});

const updatedCategory = z.object({
  body: z.object({
    name: z.string().min(4).optional(),
  }),
});

export const CategoryValidation = {
  createCategory,
  updatedCategory,
};
