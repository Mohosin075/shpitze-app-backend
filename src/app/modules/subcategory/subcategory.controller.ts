import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import getFilePath from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { SubcategoryService } from './subcategory.service';

const createSubcategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubcategoryService.createSubcategoryToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subcategory created successfully',
    data: result,
  });
});

const getAllSubcategory = catchAsync(async (req: Request, res: Response) => {
  
  const result = await SubcategoryService.getAllSubcategoryFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All SubCategory retrieved successfully',
    data: result,
  });
});

const getSingleSubcategoryFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await SubcategoryService.getSingleSubcategoryFromDB(
      req.params.id
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Single SubCategory retrieved successfully',
      data: result,
    });
  }
);

const updateSubcategoryToDB = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await SubcategoryService.updateSubcategoryToDB(
      req.params.id,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Updated SubCategory successfully',
      data: result,
    });
  }
);

const deleteSubcategoryFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SubcategoryService.deleteSubcategoryFromDB(
      req.params.id
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Deleted SubCategory successfully',
      data: result,
    });
  }
);

export const SubcategoryController = {
  createSubcategory,
  getAllSubcategory,
  getSingleSubcategoryFromDB,
  updateSubcategoryToDB,
  deleteSubcategoryFromDB,
};
