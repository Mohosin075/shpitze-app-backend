import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import getFilePath from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './category.service';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  let image = getFilePath(req.files, 'images');
  const value = {
    image,
    ...req.body,
  };

  const result = await CategoryService.createCategoryToDB(value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category created successfully',
    data: result,
  });
});

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await CategoryService.getAllCategoryFromDB(query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All Category retrieved successfully',
    data: result,
  });
});

const getSingleCategoryFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await CategoryService.getSingleCategoryFromDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Single Category retrieved successfully',
      data: result,
    });
  }
);

const updateCategoryToDB = catchAsync(async (req: Request, res: Response) => {

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const payload = {
    image,
    ...req.body
  }

  const result = await CategoryService.updateCategoryToDB(
    req.params.id,
    payload
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Update Category successfully',
    data: result,
  });
});

const deleteCategoryFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.deleteCategoryFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Deleted Category successfully',
    data: result,
  });
});

const getSubCategoryByCategory = catchAsync(async (req: Request, res: Response) => {

  const result = await CategoryService.getSubCategoryByCategoryFromDB(req.params.subCategory);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Sub Category Retrieved successfully',
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategory,
  getSingleCategoryFromDB,
  updateCategoryToDB,
  deleteCategoryFromDB,
  getSubCategoryByCategory
};
