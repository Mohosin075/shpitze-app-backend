import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...providerData } = req.body;
    await UserService.createProviderToDB(providerData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        'Please check your email to verify your account. We have sent you an OTP to complete the registration process.',
    });
  }
);

const createEmployer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...employerData } = req.body;
    await UserService.createEmployerToDB(employerData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        'Please check your email to verify your account. We have sent you an OTP to complete the registration process.',
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

const getProviderDetails = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await UserService.getProviderDetailsFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Provider Retrieved successfully',
    data: result
  });
});


const getProviderProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getProviderProfileFromDB(req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Provider Retrieved successfully',
    data: result
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image;
    if (req.files && 'image' in req.files && req.files.image[0]) {
      image = `/images/${req.files.image[0].filename}`;
    }

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

//update profile
const updateLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const payload = {
    longitude: Number(req.body.longitude), 
    latitude: Number(req.body.latitude)
  }
  const result = await UserService.updateLocationToDB(user, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User Location Updated successfully',
    data: result
  });
});

const getProviderList = catchAsync(async(req: Request, res: Response)=>{
  const result = await UserService.getProviderFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Provider List retrieved successfully',
    data: result
  });
})

const getEmployerList = catchAsync(async(req: Request, res: Response)=>{
  const result = await UserService.getEmployerFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Employer List retrieved successfully',
    data: result
  });
})

export const UserController = {
  createProvider,
  getUserProfile,
  updateProfile,
  createEmployer,
  getProviderDetails,
  updateLocation,
  getProviderProfile,
  getProviderList,
  getEmployerList
};
