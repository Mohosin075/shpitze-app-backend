import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AdminService } from './admin.service';

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await AdminService.createAdminToDB(payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin created Successfully',
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.params.id;
  const result = await AdminService.deleteAdminFromDB(payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin Deleted Successfully',
    data: result,
  });
});

const getAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAdminFromDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin Retrieved Successfully',
    data: result,
  });
});

const getSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getSummaryFromDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin Retrieved Successfully',
    data: result,
  });
});

const earningStatistic = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.earningStatisticFromDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Earning Statistic Retrieved Successfully',
    data: result,
  });
});

const userStatistic = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.userStatisticFromDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User Statistic Retrieved Successfully',
    data: result,
  });
});

export const AdminController = {
  deleteAdmin,
  createAdmin,
  getAdmin,
  getSummary,
  earningStatistic,
  userStatistic
};
