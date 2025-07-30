import { Request, Response } from 'express';
import { ServiceListService } from './serviceList.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';

const createServiceListToDB = catchAsync( async (req: Request, res: Response) => {
  
  const provider = req.user?.id;
  const payload = {
    provider: provider,
    ...req.body
  }

  const result = await ServiceListService.createServiceListToDB(payload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'ServiceList created successfully',
    data: result,
  });
});

const getAllServiceListFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceListService.getAllServiceListFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'ServiceList Retrieved successfully',
    data: result,
  });
});

const serviceDetails = catchAsync( async (req: Request, res: Response) => {
  const result = await ServiceListService.serviceDetailsFromDB(req.user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Service Retrieved successfully',
    data: result
  });
});

const updateServiceToDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceListService.updateServiceToDB(
    req.user,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Service Updated successfully',
    data: result,
  });
});


const deleteServiceListFromDB = async (req: Request, res: Response) => {
  const result = await ServiceListService.deleteServiceListFromDB(
    req.params.id
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Service Deleted successfully',
    data: result,
  });
};

const getServiceBySubCategory = catchAsync(async(req: Request, res: Response)=>{
  const user = req.user;
  const queries = req.query
  const result = await ServiceListService.getServiceBySubCategoryFromDB(
    req.params.subCategory,
    user,
    queries
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Service Retrieved successfully',
    data: result
  });
})

export const ServiceListController = {
  createServiceListToDB,
  getAllServiceListFromDB,
  serviceDetails,
  updateServiceToDB,
  deleteServiceListFromDB,
  getServiceBySubCategory
};
