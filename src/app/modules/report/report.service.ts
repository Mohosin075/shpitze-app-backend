import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { reportSearchAbleFields } from './report.constant';
import { IReport } from './report.interface';
import { Report } from './report.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import { IUser } from '../user/user.interface';


interface SearchCondition {
  details?: { $regex: string; $options: string };
  type?: { $regex: string; $options: string };
  provider?: { $in: mongoose.Types.ObjectId[] };
  employer?: { $in: mongoose.Types.ObjectId[] };
}

const createReportToDB = async (payload: IReport): Promise<IReport> => {

  if (!mongoose.Types.ObjectId.isValid(payload.provider))
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Provider ID");

  const report = await Report.create(payload);
  if (!report) {
    throw new Error('Failed to create report');
  }
  return report;
};

const getAllReportsFromDB = async (query: Record<string, unknown>) => {
  const { searchTerm, date, page, limit, ...filterData } = query;
  const anyConditions: any[] = [];

  // Search term filtering helper
  const getSearchConditions = async () => {
    if (!searchTerm) return [];

    // Basic search on details and type fields
    const searchConditions: SearchCondition[]  = [
      { details: { $regex: searchTerm as string, $options: "i" } },
      { type: { $regex: searchTerm as string, $options: "i" } }
    ];

    // Fetch relevant users for filtering by provider or employer roles
    const users = await User.find({ firstName: new RegExp(searchTerm as string, 'i') }, "_id role");
    const providerIds = users.filter((user) => user.role === "PROVIDER").map((user) => user._id);
    const employerIds = users.filter((user) => user.role === "EMPLOYER").map((user) => user._id);

    // Add conditions for provider and employer if applicable
    if (providerIds.length > 0) searchConditions.push({ provider: { $in: providerIds } });
    if (employerIds.length > 0) searchConditions.push({ employer: { $in: employerIds } });

    return [{ $or: searchConditions }];
  };

  if (date) {
    anyConditions.push({
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y/%m/%d", date: "$createdAt" } },date
        ]
      }
    });
  }
  

  // Filter conditions for search term
  const searchConditions = await getSearchConditions();
  anyConditions.push(...searchConditions);

  // Additional filters for other fields
  if (Object.keys(filterData).length) {
    anyConditions.push({
      $and: Object.entries(filterData).map(([field, value]) => ({
        [field]: value
      }))
    });
  }

  // Apply filter conditions
  const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await Report.find(whereConditions)
  .populate("provider", "firstName lastName")
  .populate("employer", "firstName lastName")
  .skip(skip)
  .limit(size)
  .lean();
  const count = await Report.countDocuments(whereConditions);

  const data: any = {
    result,
    meta: {
      page: pages,
      total: count
    }
  }
  // Execute query with optimized population
  return data
};




export const ReportService = {
  createReportToDB,
  getAllReportsFromDB,
};
