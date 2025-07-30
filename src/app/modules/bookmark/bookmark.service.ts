import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IBookmark } from './bookmark.interface';
import { Bookmark } from './bookmark.model';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import getDistanceFromOriginDestination from '../../../helpers/getDistanceHelper';
import { Schedule } from '../schedule/schedule.model';
import { User } from '../user/user.model';

const toggleBookmark = async (payload: JwtPayload): Promise<string> => {

  // Check if the bookmark already exists
  const existingBookmark: any = await Bookmark.findOne({
    employer: payload.employer,
    service: payload.service,
  });

  if (existingBookmark) {
    // If the bookmark exists, delete it
    await Bookmark.findByIdAndDelete(existingBookmark._id);
    return 'Bookmark Remove successfully';
  } else {
    // If the bookmark doesn't exist, create it
    const result = await Bookmark.create(payload);
    if (!result) {
      throw new ApiError(
        StatusCodes.EXPECTATION_FAILED,
        'Failed to add bookmark'
      );
    }
    return 'Bookmark Added successfully';
  }
};

const getBookmark = async (user: JwtPayload): Promise<IBookmark[]> => {
  const employer: any = await User.findById(user.id).select("location")

  const services: any = await Bookmark.find({
    employer: user?.id
  })
    .populate({
      path: "service",
      populate: {
        path: "provider",
        select: "firstName lastName image address rating ratingCount location"
      }
    })
    .select("service");
  
  if(!services){
    return [];
  }


  const result: any = await Promise.all(services?.map(async (service: any) => {
    const singleService = service.toObject();

    const { service: newService, ...otherService } = singleService;
    const { provider, ...otherProvider } = newService;


    const schedule = await Schedule.find({ provider: provider?._id }).select("date times");
    const distance: any = await getDistanceFromOriginDestination(service?.provider?.location, employer?.location);


    const data = {
      ...newService,
      distance: distance || 0,
      schedule: schedule,
    }
    return data
  }))

  return result;
};

export const BookmarkService = { toggleBookmark, getBookmark };

