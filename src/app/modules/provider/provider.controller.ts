import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProviderService } from './provider.service';

const updateEducation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const { ...educationData } = req.body;

  const result = await ProviderService.updateEducationToDB(user, educationData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Education background updated successfully',
    data: result,
  });
});

const getAllProvider = catchAsync(async (req: Request, res: Response) => {
  const result = await ProviderService.getAllProvider(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Provider retrived successfully',
    data: result,
  });
});

const deleteProviderFromDb = catchAsync(async (req: Request, res: Response) => {
  const result = await ProviderService.deleteProviderFromDb(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Provider deleted successfully',
    data: result,
  });
});

export const ProviderController = {
  updateEducation,
  getAllProvider,
  deleteProviderFromDb,
};
