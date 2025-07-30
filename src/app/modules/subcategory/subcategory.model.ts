import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { ISubcategory } from './subcategory.interface';

const subcategorySchema = new Schema<ISubcategory>(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    }
  },
  { timestamps: true }
);

subcategorySchema.pre('save', async function (next) {
  const isExist = await Subcategory.findOne({
    categoryName: this.categoryName,
    name: this.name,
  });
  if (isExist) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Please change the subcategory name, ${this.name} already exist under the category ${this.categoryName}!`
    );
  }
  next();
});

export const Subcategory = model<ISubcategory>(
  'Subcategory',
  subcategorySchema
);
