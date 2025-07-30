import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import mongoose from 'mongoose';
import { Booking } from '../booking/booking.model';
import { IBooking } from '../booking/booking.interface';

const createAdminToDB = async (payload: IUser): Promise<IUser> => {
  const createAdmin: any = await User.create(payload);
  if (!createAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Admin');
  }
  if (createAdmin) {
    await User.findByIdAndUpdate(
      { _id: createAdmin?._id },
      { verified: true },
      { new: true }
    );
  }
  return createAdmin;
};

const deleteAdminFromDB = async (id: any): Promise<IUser | undefined> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }
  const isExistAdmin = await User.findByIdAndDelete(id);
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete Admin');
  }
  return;
};

const getAdminFromDB = async (): Promise<IUser[]> => {
  const admins = await User.find({ role: 'ADMIN' })
  return admins;
};


const getSummaryFromDB = async () => {

  // total employer
  const employer = await User.countDocuments({ role: "EMPLOYER" })

  // total provider
  const provider = await User.countDocuments({ role: "PROVIDER" })

  // get starting date
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0); // Set time to midnight

  // get end date 
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // total income
  const income = await Booking.aggregate([
    {
      $group: {
        _id: null,
        totalIncome: { $sum: "$price" }
      }
    },
    {
      $project: {
        totalIncome: 1, // If you want to keep the totalIncome field for reference
        totalRevenue: { $subtract: ["$totalIncome", { $multiply: ["$totalIncome", 0.9] }] } // Subtract 10%
      }
    }
  ]);

  // today employer count
  const employerCountToday = await User.countDocuments({
    role: "EMPLOYER",
    createdAt: { $gte: startOfToday, $lt: endOfToday }
  });

  // today employer count
  const providerCountToday = await User.countDocuments({
    role: "PROVIDER",
    createdAt: { $gte: startOfToday, $lt: endOfToday }
  });

  // today income 
  const incomeCountToday = await Booking.aggregate([
    // Calculate daily income (today's income)
    {
      $match: {
        createdAt: { $gte: startOfToday, $lt: endOfToday } // Filter for today's bookings
      }
    },
    {
      $group: {
        _id: null,
        dailyIncome: { $sum: "$price" } // Sum of prices for today's bookings
      }
    },
    {
      $project: {
        _id: 0,
        dailyIncome: 1,
        dailyRevenue: { $subtract: ["$dailyIncome", { $multiply: ["$dailyIncome", 0.9] }] } // Calculate daily revenue after 10% reduction
      }
    }
  ]);





  const data = {
    totalEmployer: employer,
    totalProvider: provider,
    income: income[0] || {},
    employerCountToday,
    providerCountToday,
    incomeCountToday: incomeCountToday[0] || {}
  }

  return data;
}

const earningStatisticFromDB = async (): Promise<IBooking[]> => {

  // month with 0 income
  const months: any = [
    { name: "Jan", totalIncome: 0 },
    { name: "Feb", totalIncome: 0 },
    { name: "Mar", totalIncome: 0 },
    { name: "Apr", totalIncome: 0 },
    { name: "May", totalIncome: 0 },
    { name: "Jun", totalIncome: 0 },
    { name: "Jul", totalIncome: 0 },
    { name: "Aug", totalIncome: 0 },
    { name: "Sep", totalIncome: 0 },
    { name: "Oct", totalIncome: 0 },
    { name: "Nov", totalIncome: 0 },
    { name: "Dec", totalIncome: 0 },
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear + 1, 0, 1);

  const monthlyEarnings = await Booking.aggregate([
    { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        totalIncome: { $sum: '$price' },
      },
    }

  ]);

  monthlyEarnings.forEach((income: any) => {
    const monthIndex = income._id.month - 1;
    months[monthIndex].totalIncome = income.totalIncome;
  });

  return months;
}

const userStatisticFromDB = async (): Promise<IUser[]> => {
  const months: any = [
    { name: "Jan", provider: 0, employer: 0 },
    { name: "Feb", provider: 0, employer: 0 },
    { name: "Mar", provider: 0, employer: 0 },
    { name: "Apr", provider: 0, employer: 0 },
    { name: "May", provider: 0, employer: 0 },
    { name: "Jun", provider: 0, employer: 0 },
    { name: "Jul", provider: 0, employer: 0 },
    { name: "Aug", provider: 0, employer: 0 },
    { name: "Sep", provider: 0, employer: 0 },
    { name: "Oct", provider: 0, employer: 0 },
    { name: "Nov", provider: 0, employer: 0 },
    { name: "Dec", provider: 0, employer: 0 },
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear + 1, 0, 1);

  // Aggregate users by month
  const monthlyEmployer = await User.aggregate([
    { $match: { role: "EMPLOYER", createdAt: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } } }
  ]);

  // Aggregate artists by month
  const monthlyProvider = await User.aggregate([
    { $match: { role: "PROVIDER", createdAt: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } } }
  ]);

  // Merge user data into the months array
  monthlyEmployer.forEach((employer: any) => {
    const monthIndex = employer._id.month - 1;
    months[monthIndex].employer = employer.count;
  });

  // Merge provider data into the months array
  monthlyProvider.forEach((provider: any) => {
    const monthIndex = provider._id.month - 1;
    months[monthIndex].provider = provider.count;
  });

  return months;
};



export const AdminService = {
  createAdminToDB,
  deleteAdminFromDB,
  getAdminFromDB,
  getSummaryFromDB,
  earningStatisticFromDB,
  userStatisticFromDB
};
