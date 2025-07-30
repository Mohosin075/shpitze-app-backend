import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { ICategory } from './category.interface';

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', async function (next) {
  const isExist = await Category.findOne({ name: this.name });
  if (isExist) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Please change the category name, ${this.name} already exist!`
    );
  }
  next();
});

export const Category = model<ICategory>('Category', categorySchema);
