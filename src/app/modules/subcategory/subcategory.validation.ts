import { z } from 'zod';

const createSubCategory = z.object({
  body: z.object({
    categoryName: z.string({ required_error: 'categoryName is required' }),
    name: z.string({ required_error: 'name is required' }),
  }),
});

const updatedSubCategory = z.object({
  body: z.object({
    categoryName: z.string().optional(),
    name: z.string().optional(),
  }),
});

export const SubCategoryValidation = {
  createSubCategory,
  updatedSubCategory,
};
