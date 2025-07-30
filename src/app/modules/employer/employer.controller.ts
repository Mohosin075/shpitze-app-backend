import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { EmployerService } from './employer.service';
import { Request, Response } from 'express';

const updateEmployerToDB = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const { ...employerData } = req.body;

  const result = await EmployerService.updateEmployerToDB(user, employerData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Employer background updated successfully',
    data: result,
  });
});

const getAllEmployerFromDb = catchAsync(async (req, res) => {
  const result = await EmployerService.getAllEmployer(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Employer retrieved successfully',
    data: result,
  });
});

const deleteEmployers = catchAsync(async (req, res) => {
  const result = await EmployerService.deleteEmployers(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Employer deleted successfully',
    data: result,
  });
});

export const EmployerController = {
  getAllEmployerFromDb,
  updateEmployerToDB,
  deleteEmployers,
};
