import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICategory } from './category.interface';
import { Category } from './category.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { categorySearchAbleFields } from './category.constant';
import { Subcategory } from '../subcategory/subcategory.model';
import mongoose from 'mongoose';
import unlinkFile from '../../../shared/unlinkFile';

const createCategoryToDB = async (payload: ICategory): Promise<ICategory> => {
  const createCategory = await Category.create(payload);
  if (!createCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create category');
  }
  return createCategory;
};

const getAllCategoryFromDB = async (query: Record<string, unknown>) => {
  const categoryBuilder = new QueryBuilder(Category.find(), query)
    .search(categorySearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await categoryBuilder.modelQuery;

  return result;
};

const getSingleCategoryFromDB = async (id: string) => {
  const result = await Category.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  }
  return result;
};

const updateCategoryToDB = async (id: string, payload: Partial<ICategory>) => {
  const isExistCategory: ICategory | null = await Category.findById(id);

  if(payload.image){
    unlinkFile(isExistCategory?.image as string);
  }

  const result = await Category.findOneAndUpdate(
    { _id: id }, 
    payload, 
    {new: true}
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  }
  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  if(!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");


  const result = await Category.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  }
  return result;
};


const getSubCategoryByCategoryFromDB = async(categoryName:string)=>{
  const subcategories = await Subcategory.find({categoryName}).lean();

   // Map over subcategories and add the total count for each one
   const subCategoriesWithCount = await Promise.all(
    subcategories.map(async (subcategory: any) => {
      const count = await Subcategory.countDocuments({ categoryName: subcategory.categoryName });
      return {
        ...subcategory,
        total: count,
      };
    })
  );

  return subCategoriesWithCount;
}

export const CategoryService = {
  createCategoryToDB,
  getAllCategoryFromDB,
  getSingleCategoryFromDB,
  updateCategoryToDB,
  deleteCategoryFromDB,
  getSubCategoryByCategoryFromDB
};
