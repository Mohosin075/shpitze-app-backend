import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import getDistanceFromOriginDestination from "../../../helpers/getDistanceHelper"
import { IServiceList } from './serviceList.interface';
import moment from 'moment';
import { ServiceList } from './serviceList.model';
import mongoose from 'mongoose';
import { Schedule } from '../schedule/schedule.model';
import { Bookmark } from '../bookmark/bookmark.model';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';

const createServiceListToDB = async (payload: Partial<IServiceList> & { schedule?: { date: string; times: any[]; }[] }): Promise<IServiceList | undefined> => {

  const { schedule, ...otherData } = payload

  const data: any = schedule?.map((item: any) => ({
    date: item.date,
    month: item?.date?.split(" ")[1],
    year: item?.date?.split(" ")[2],
    times: item.times,
    provider: payload.provider
  }));

  const createSchedule: any = await Schedule.insertMany(data);
  if (!createSchedule) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to created service list');
  }
  const result = await ServiceList.create(otherData);

  if (!result) {
    await Schedule.findByIdAndDelete(createSchedule._id)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to created service list');
  }

  return result;
};

const getAllServiceListFromDB = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [];

  if (searchTerm) {
    // Get matching user IDs based on `firstName` or `profession`
    const userIds = await User.find({
      $or: [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { profession: { $regex: searchTerm, $options: "i" } }
      ]
    }).distinct("_id");

    // Only add `provider` condition if there are matching users
    if (userIds.length > 0) {
      anyConditions.push({ provider: { $in: userIds } });
    }
  }

  // Additional filters for other fields
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(([field, value]) => ({
      [field]: value
    }));
    anyConditions.push({ $and: filterConditions });
  }

  // Apply filter conditions
  const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await ServiceList.find(whereConditions)
    .populate("provider", "firstName lastName profession")
    .skip(skip)
    .limit(size)
    .lean();
  const count = await ServiceList.countDocuments(whereConditions);

  const data: any = {
    result,
    meta: {
      page: pages,
      total: count
    }
  }
  return data;
};


const serviceDetailsFromDB = async (user: JwtPayload): Promise<IServiceList | {}> => {

  const result = await ServiceList.findOne({ provider: user.id });
  if (!result) {
    return {}
  }
  return result;
};

const updateServiceToDB = async (user: JwtPayload, payload: Partial<IServiceList>) => {

  const result = await ServiceList.findOneAndUpdate({ provider: user?.id },
    payload,
    { new: true }
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service list not found');
  }

  return result;
};

const deleteServiceListFromDB = async (id: string) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
  }

  const result = await ServiceList.findByIdAndUpdate(
    { _id: id },
    {
      status: 'delete',
      new: true,
    }
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service list not found');
  }
  return result;
};

const getServiceBySubCategoryFromDB = async (payload: string, user: JwtPayload, queries: any): Promise<IServiceList[]> => {

  const employer: any = await User.findById(user?.id).select("location");

  if (!employer?.location) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Please update your location first");
  }

  const { search, price, radius, city, ...otherData } = queries;

  const allSchedules = await Schedule.find({});
  const today = moment().startOf('day');

  // Filter to only get future or today dates
  const futureSchedules = allSchedules.filter(schedule => {
    const scheduleDate = moment(schedule.date, 'D MMMM YYYY');
    return scheduleDate.isSameOrAfter(today);
  });

  const providerIds = [...new Set(futureSchedules.map(s => s.provider))];


  const anyConditions = [];
  anyConditions.push({
    subCategory: payload,
    provider: { $in: providerIds },
    available: true,
  });

  // filter by month and year
  if (Object.keys(otherData).length) {
    anyConditions.push({
      $and: Object.entries(queries).map(([field, value]) => ({
        [field]: value
      }))
    })
  }

  // Filter by radius if provided
  if (radius) {

    const servicesIds = await ServiceList.find({ subCategory: payload }).distinct("provider");
    const providers = await User.find({ _id: { $in: servicesIds } }).select("location").lean();

    const isValidCoordinates = (longitude: any, latitude: any) => {
      return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
    };

    const result: any = await Promise.all(providers?.map(async (provider: any) => {
      const { coordinates } = provider?.location || {};

      if (coordinates && isValidCoordinates(coordinates[0], coordinates[1])) {
        const matchedUserIds = await User.find({
          location: {
            $geoWithin: {
              $centerSphere: [
                [coordinates[0], coordinates[1]], // [longitude, latitude]
                Number(radius) / 6378.1 // Convert radius from kilometers to radians
              ]
            }
          }
        }).distinct('_id');

        return matchedUserIds;
      }

      return [];
    }));

    const flattenedResults = result?.flat();

    anyConditions.push({
      provider: { $in: flattenedResults }
    });
  }

  if (city) {
    anyConditions.push({ provider: { $in: await User.find({ city: city }).distinct("_id") } });
  }

  //service search here
  if (search) {
    anyConditions.push({
      $or: ["category", "subCategory", "rateType"].map((field) => ({
        [field]: {
          $regex: search,
          $options: "i"
        }
      }))
    });
  }

  //service filter with price range
  if (price) {
    anyConditions.push({
      $expr: {
        $and: [
          { $gte: [{ $toDouble: "$price" }, price] },
          { $lte: [{ $toDouble: "$price" }, 0] }
        ]
      }
    });
  }

  const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};


  const services = await ServiceList.find(whereConditions)
    .populate({
      path: "provider",
      select: "firstName lastName image address rating ratingCount location"
    })
    .select("subCategory category rate rateType bookingSystem").lean();

  const bookmarkId = await Bookmark.find({}).distinct("service");
  const bookmarkIdStrings = bookmarkId.map((id: any) => id.toString());

  const result: any = await Promise.all(services?.map(async (service: any) => {
    const isBookmark = bookmarkIdStrings.includes(service?._id?.toString());
    const schedule = await Schedule.find({ provider: service?.provider?._id }).select("date times");

    // Filter to only get future or today dates
    const futureSchedules = schedule.filter(schedule => {
      const scheduleDate = moment(schedule.date, 'D MMMM YYYY');
      return scheduleDate.isSameOrAfter(today);
    });

    const distance: any = await getDistanceFromOriginDestination(service?.provider?.location, employer?.location);
    const data = {
      ...service,
      distance: distance || 0,
      schedule: futureSchedules,
      bookmark: isBookmark,
    }
    return data
  }))

  return result;
}

export const ServiceListService = {
  createServiceListToDB,
  getAllServiceListFromDB,
  serviceDetailsFromDB,
  updateServiceToDB,
  deleteServiceListFromDB,
  getServiceBySubCategoryFromDB
};

