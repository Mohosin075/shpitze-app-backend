import { IEmployer } from './../employer/employer.interface';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import mongoose, { startSession } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IProvider } from '../provider/provider.interface';
import { Provider } from '../provider/provider.model';
import { IUser } from './user.interface';
import { User } from './user.model';
import { Employer } from '../employer/employer.model';
import { ServiceList } from '../serviceList/serviceList.model';
import { IServiceList } from '../serviceList/serviceList.interface';
import { Review } from '../review/review.model';
import { Schedule } from '../schedule/schedule.model';
import { ICreateAccount } from '../../../types/emailTamplate';

const createProviderToDB = async (payload: Partial<IUser & IProvider>) => {
  const session = await startSession();

  try {
    session.startTransaction();

    // Set role and extract necessary fields
    payload.role = USER_ROLES.PROVIDER;

    // Create provider and user
    const [provider] = await Provider.create([{ certification: "" }], { session });
    if (!provider) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create provider');
    }

    payload.provider = provider._id;
    const [user] = await User.create([payload], { session });
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    // Generate OTP and prepare email
    const otp = generateOTP();
    const emailValues: ICreateAccount = {
      name: user.firstName as string,
      otp,
      email: user.email as string,
    };
    const accountEmailTemplate = emailTemplate.createAccount(emailValues);
    emailHelper.sendEmail(accountEmailTemplate);

    // Update user with authentication details
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    };
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { authentication } },
      { session } // `new: true` returns the updated document
    );

    if (!updatedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found for update');
    }

    // Commit transaction
    await session.commitTransaction();
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // Ensure session ends regardless of success or failure
    await session.endSession();
  }
};

const createEmployerToDB = async (payload: Partial<IUser & IEmployer>) => {
  const session = await startSession();

  try {
    session.startTransaction();

    // Set role and extract necessary fields
    payload.role = USER_ROLES.EMPLOYER;

    // Create provider and user
    const [employer] = await Employer.create([{ rating: 0 }], { session });
    if (!employer) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create provider');
    }

    payload.employer = employer._id;
    const [user] = await User.create([payload], { session });
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    // Generate OTP and prepare email
    const otp = generateOTP();
    const emailValues: ICreateAccount = {
      name: user.firstName as string,
      otp,
      email: user.email as string,
    };
    const accountEmailTemplate = emailTemplate.createAccount(emailValues);
    emailHelper.sendEmail(accountEmailTemplate);

    // Update user with authentication details
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    };
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { authentication } },
      { session } // `new: true` returns the updated document
    );

    if (!updatedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found for update');
    }

    // Commit transaction
    await session.commitTransaction();
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // Ensure session ends regardless of success or failure
    await session.endSession();
  }
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.findById(id).populate('provider employer profession');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getProviderDetailsFromDB = async (id: string): Promise<IServiceList | {}> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  const result: any = await ServiceList.findOne({ provider: id })
    .populate({
      path: "provider",
      select: "firstName lastName image rating ratingCount",
      populate: {
        path: "provider",
        select: "certification degree institution leftHanded skills specializations yearOfCompletion"
      }
    }).select("rating totalRating rate rateType bookingSystem category subCategory").lean();

  if (!result) {
    return {};
  }

  const reviews = await Review.find({ provider: id })
    .populate({
      path: "employer",
      select: "firstName lastName image"
    })
    .select(" employer comment rating createdAt")



  const { provider, ...otherInformation } = result;
  const { provider: educationDetails, ...basicProviderInfo } = provider;

  const schedule = await Schedule.find({ provider: provider?._id }).select("date times")

  const results: any = {
    ...otherInformation,
    provider: basicProviderInfo || {},
    education: educationDetails || {},
    reviews: reviews,
    schedule: schedule
  }

  return results;
}

const getProviderProfileFromDB = async (user: JwtPayload): Promise<IServiceList | {}> => {
  const result = await User.findById(user.id)
    .populate("provider")
    .select("firstName lastName email contact address rating ratingCount address2 city zipCode province image provider profession");

  if (!result) {
    return {};
  }

  const service: any = await ServiceList.findOne({ provider: user.id })
    .select("rate rateType bookingSystem category subCategory").lean();

  const reviews = await Review.find({ provider: user.id })
    .populate({
      path: "employer",
      select: "firstName lastName image"
    })
    .select(" employer comment rating createdAt")



  const schedule = await Schedule.find({ provider: user.id }).select("date times")

  const results: any = {
    result,
    service: service || {},
    reviews: reviews,
    schedule: schedule
  }

  return results;
}

const updateLocationToDB = async (user: JwtPayload, payload: { longitude: number; latitude: number }): Promise<IUser | null> => {

  const result = await User.findByIdAndUpdate(
    user.id, // Use the user ID to find the document
    {
      $set: {
        "location.type": "Point", // Ensure the type is set to 'Point'
        "location.coordinates": [payload.longitude, payload.latitude] // Set the coordinates
      }
    },
    { new: true } // Return the updated document
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Failed to update user location");
  }

  return result;
};

const getProviderFromDB = async (query: Record<string, unknown>): Promise<IUser[]> => {

  const { searchTerm, page, limit, rating, ...filerData } = query;
  const anyConditions = [];

  anyConditions.push({
    role: "PROVIDER"
  });

  //service search here
  if (searchTerm) {
    anyConditions.push({
      $or: ["firstName", "lastName", "profession"].map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i"
        }
      }))
    });
  }

  //artist filter with price range
  if (rating) {
    anyConditions.push({
      rating: {
        $gte: Number(rating),
        $lt: Number(rating) + 1
      },
    });
  }

  // artist filter here
  if (Object.keys(filerData).length) {
    anyConditions.push({
      $and: Object.entries(filerData).map(([field, value]) => ({
        [field]: value
      }))
    })
  }

  const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await User.find(whereConditions).skip(skip).limit(size).lean();
  const count = await User.countDocuments(whereConditions);

  const data: any = {
    result,
    meta: {
      page: pages,
      total: count
    }
  }

  return data;

}

const getEmployerFromDB = async (query: Record<string, unknown>): Promise<IUser[]> => {

  const { search, page, limit, ...filerData } = query;
  const anyConditions = [];

  anyConditions.push({
    role: "EMPLOYER"
  });

  //service search here
  if (search) {
    anyConditions.push({
      $or: ["firstName", "lastName", "profession"].map((field) => ({
        [field]: {
          $regex: search,
          $options: "i"
        }
      }))
    });
  }

  // artist filter here
  if (Object.keys(filerData).length) {
    anyConditions.push({
      $and: Object.entries(filerData).map(([field, value]) => ({
        [field]: value
      }))
    })
  }

  const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await User.find(whereConditions).skip(skip).limit(size).lean();
  const count = await User.countDocuments(whereConditions);

  const data: any = {
    data: result,
    meta: {
      page: pages,
      total: count
    }
  }

  return data;

}

export const UserService = {
  createProviderToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  createEmployerToDB,
  getProviderDetailsFromDB,
  updateLocationToDB,
  getProviderProfileFromDB,
  getProviderFromDB,
  getEmployerFromDB
};
