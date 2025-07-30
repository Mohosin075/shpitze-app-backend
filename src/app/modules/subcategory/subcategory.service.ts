import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ISubcategory } from './subcategory.interface';
import { Subcategory } from './subcategory.model';
import { Category } from '../category/category.model';
import mongoose from 'mongoose';

const createSubcategoryToDB = async (
  payload: ISubcategory
): Promise<ISubcategory> => {
  const categoryExists = await Category.findOne({
    name: payload.categoryName,
  });

  if (!categoryExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Category does not exist');
  }

  const createCategory = await Subcategory.create(payload);
  if (!createCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Subcategory');
  }
  return createCategory;
};

const getAllSubcategoryFromDB = async (): Promise<ISubcategory[]> => {
  const result = await Subcategory.find();
  return result;
};

const getSingleSubcategoryFromDB = async (
  id: string
): Promise<ISubcategory> => {
  const result = await Subcategory.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subcategory not found');
  }
  return result;
};

const updateSubcategoryToDB = async (
  id: string,
  payload: ISubcategory
): Promise<ISubcategory> => {
  const categoryExists = await Category.findOne({
    name: payload.categoryName,
  });

  if (!categoryExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Category does not exist');
  }

  const isExist = await Subcategory.findOne({
    name: payload.name,
  });

  if (isExist) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'already exist this subcategory'
    );
  }

  const result = await Subcategory.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subcategory not found');
  }
  return result;
};

const deleteSubcategoryFromDB = async (id: string) => {
  if(!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");

  
  const result = await Subcategory.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subcategory not found');
  }
  return result;
};

export const SubcategoryService = {
  createSubcategoryToDB,
  getAllSubcategoryFromDB,
  getSingleSubcategoryFromDB,
  updateSubcategoryToDB,
  deleteSubcategoryFromDB,
};
