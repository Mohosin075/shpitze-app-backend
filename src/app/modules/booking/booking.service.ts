import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IBooking } from "./booking.interface";
import { Booking } from "./booking.model";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { EMPLOYER_NOTIFICATION, PROVIDER_NOTIFICATION } from "../../../enums/notification";
import { sendNotifications } from "../../../helpers/notificationsHelper";
import updateSchedule from "../../../helpers/updateSchedule";
import createChat from "../../../helpers/createChatHelper";
import disableChat from "../../../helpers/disableChatHelper";
import mongoose from "mongoose";

const createBooking = async (payload: any): Promise<IBooking> => {

    const provider = await User.findById(payload.provider)

    if (payload.bookingSystem === "instant_booking") {
        payload.status = "Accept";
    }

    const booking = await Booking.create(payload);
    if (!booking) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Booked A Booking")
    }
    await updateSchedule(payload);

    if (payload.bookingSystem === "instant_booking") {
        const data = {
            text: `Hello ${provider?.firstName}, an urgent booking request has been made for ${payload?.category}. Please review and accept the request as soon as possible.`,
            title: PROVIDER_NOTIFICATION.URGENT_BOOKING,
            link: booking?._id,
            sender: payload?.employer,
            direction: "booking",
            receiver: payload.provider
        }
        await sendNotifications(data);
    } else {
        const data = {
            text: `You have received a booking request for ${payload?.schedule[0]?.date} at ${payload?.schedule[0]?.times[0]}. Please accept or decline within 24 hours.`,
            title: PROVIDER_NOTIFICATION.BOOKING_REQUEST,
            link: booking?._id,
            sender: payload?.employer,
            direction: "booking",
            receiver: payload.provider
        }
        await sendNotifications(data);
    }

    return booking;
}

const providerBookingFromDB = async (user: JwtPayload, status: string): Promise<IBooking[]> => {

    const anyConditions = [];
    anyConditions.push({
        provider: user?.id,
    });

    if (status) {
        anyConditions.push({
            status: status
        });
    }

    const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};

    const result = await Booking.find(whereConditions).populate([
        {
            path: "provider",
            select: "firstName profession lastName image address rating ratingCount"
        },
        {
            path: "employer",
            select: "firstName profession lastName image address"
        },
    ])
    return result;
}

const employerBookingFromDB = async (user: JwtPayload, status: string): Promise<IBooking[]> => {

    const anyConditions = [];
    anyConditions.push({
        employer: user?.id
    });

    if (status) {
        anyConditions.push({
            status: status
        });
    }

    const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};

    const result = await Booking.find(whereConditions).populate([
        {
            path: "provider",
            select: "firstName profession lastName image location address rating ratingCount"
        },
        {
            path: "employer",
            select: "firstName profession lastName image address"
        },
    ])
    return result;
}


// respond for booking status 
const respondBookingToDB = async (id: string, status: string): Promise<IBooking | null> => {


    // Update the booking status
    const result: any = await Booking.findByIdAndUpdate(
        { _id: id },
        { status: status },
        { new: true }
    );

    // Check if the booking was found and updated
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update booking.");
    }

    const isExistBooking: any = await Booking.findById(id).populate([
        {
            path: "provider",
            select: "firstName lastName"
        },
        {
            path: "employer",
            select: "firstName lastName"
        },
    ]).lean();

    if (status === "Accept") {
        const data = {
            text: `Hi ${isExistBooking?.employer?.firstName}, your service request for ${isExistBooking?.category} has been accepted by ${isExistBooking?.provider?.firstName} ${isExistBooking?.provider?.lastName}. The service is scheduled for ${isExistBooking?.schedule[0]?.date} at ${isExistBooking?.schedule[0]?.times[0]}`,
            title: EMPLOYER_NOTIFICATION.SERVICE_ACCEPT,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.employer
        }

        const data2 = [isExistBooking?.employer?._id, isExistBooking?.provider?._id]
        await createChat(data2);
        await sendNotifications(data);
    }

    if (status === "Reject") {
        const data = {
            text: `Hi ${isExistBooking?.employer?.firstName}, unfortunately, your service request for ${isExistBooking?.category} has been rejected. Please try booking another provider.`,
            title: EMPLOYER_NOTIFICATION.SERVICE_REJECT,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.employer
        }
        await sendNotifications(data);
    }

    return result;
};

// confirm for booking status 
const confirmBookingToDB = async (id: string, status: string): Promise<IBooking | null> => {


    // Update the booking status
    const result: any = await Booking.findByIdAndUpdate(
        { _id: id },
        { status: status },
        { new: true }
    );

    // Check if the booking was found and updated
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update booking.");
    }

    const isExistBooking: any = await Booking.findById(id).populate([
        {
            path: "provider",
            select: "firstName lastName"
        },
        {
            path: "employer",
            select: "firstName lastName"
        },
    ]).lean();

    if (status === "Complete") {
        const data = {
            text: `Hi ${isExistBooking?.employer?.firstName}, your service request for ${isExistBooking?.category} has been accepted by ${isExistBooking?.provider?.firstName} ${isExistBooking?.provider?.lastName}. The service is scheduled for ${isExistBooking?.schedule[0]?.date} at ${isExistBooking?.schedule[0]?.times[0]}`,
            title: EMPLOYER_NOTIFICATION.SERVICE_ACCEPT,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.employer
        }


        await sendNotifications(data);
        const chatPayload = [isExistBooking?.employer?._id, isExistBooking?.provider?._id]
        await disableChat(chatPayload);
    }

    return result;
};

// confirm for booking status 
const cancelBookingToDB = async (id: string): Promise<IBooking | null> => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Booking Id");
    }

    const isExistBooking: any = await Booking.findById(id).populate([
        {
            path: "provider",
            select: "firstName lastName"
        },
        {
            path: "employer",
            select: "firstName lastName"
        },
    ]).lean();

    if (!isExistBooking) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Booking not found");
    }

    // Update the booking status
    const result: any = await Booking.findByIdAndUpdate(
        { _id: id },
        { status: "Cancel" },
        { new: true }
    );

    // Check if the booking was found and updated
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update booking.");
    }

    const createdAt = new Date(isExistBooking?.createdAt).getTime();
    const now = new Date().getTime();
    const twoHoursFromNow = now + 2 * 60 * 60 * 1000;
    const twentyFourHoursFromNow = now + 24 * 60 * 60 * 1000;

    if (Math.abs(createdAt - twentyFourHoursFromNow) < 60000) {
        const data = {
            text: ` Your booking for ${isExistBooking?.schedule[0]?.date} has been canceled. A late cancellation fee of 15% has been applied. You may dispute this through the `,
            title: EMPLOYER_NOTIFICATION.BOOKING_CANCEL,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.employer,
            sender: result.provider
        }
        await sendNotifications(data);

        const data2 = {
            text: `The The ${isExistBooking?.employer?.profession} has canceled the booking for ${isExistBooking?.schedule[0]?.date}. You are no longer booked for this shift `,
            title: EMPLOYER_NOTIFICATION.BOOKING_CANCEL,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.provider,
            sender: result.employer
        }
        await sendNotifications(data2);
    }

    if (Math.abs(createdAt - twoHoursFromNow) < 60000) {
        const data = {
            text: ` Your emergency booking for ${isExistBooking?.schedule[0]?.date} has been canceled. A late cancellation fee of 30% has been applied. You may dispute this through the app. `,
            title: EMPLOYER_NOTIFICATION.BOOKING_CANCEL,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.employer,
            sender: result.provider
        }
        await sendNotifications(data);

        const data2 = {
            text: `The The ${isExistBooking?.employer?.profession} has canceled the emergency booking for ${isExistBooking?.schedule[0]?.date}. You are no longer booked for this shift `,
            title: EMPLOYER_NOTIFICATION.BOOKING_CANCEL,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.provider,
            sender: result.employer
        }
        await sendNotifications(data2);
    }


    if (isExistBooking.bookingSystem === "instant_booking") {
        const data = {
            text: `The ${isExistBooking?.employer?.profession} has canceled the booking for ${isExistBooking?.schedule[0]?.date}. You may request another hygienist or dispute this through the app.`,
            title: EMPLOYER_NOTIFICATION.BOOKING_CANCEL,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.provider,
            sender: result.employer
        }
        await sendNotifications(data);

        const data2 = {
            text: `You have canceled the emergency booking for ${isExistBooking?.schedule[0]?.date} . This may affect your profile rating.`,
            title: EMPLOYER_NOTIFICATION.BOOKING_CANCEL,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.employer,
            sender: result.provider
        }
        await sendNotifications(data2);
    } else {
        const data = {
            text: `The ${isExistBooking?.provider?.profession} has canceled the booking for ${isExistBooking?.schedule[0]?.date}. You may request another hygienist or dispute this through the app.`,
            title: EMPLOYER_NOTIFICATION.BOOKING_CANCEL,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.employer,
            sender: result.provider
        }
        await sendNotifications(data);

        const data2 = {
            text: `You have canceled the booking for ${isExistBooking?.schedule[0]?.date} . This may affect your profile rating.`,
            title: EMPLOYER_NOTIFICATION.BOOKING_CANCEL,
            link: isExistBooking?._id,
            direction: "booking",
            receiver: result.provider,
            sender: result.employer
        }
        await sendNotifications(data2);
    }

    return result;
};

const getBookingsFormDB = async (query: Record<string, unknown>): Promise<IBooking[]> => {
    const { searchTerm, date, page, limit, ...filterData } = query;

    const anyConditions: any[] = [];

    // Search term filtering helper
    const getSearchConditions: any = async () => {
        if (!searchTerm) return [];

        const searchConditions: any = []

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
                    { $dateToString: { format: "%Y/%m/%d", date: "$createdAt" } }, date
                ]
            }
        });
    }

    // Additional filters for other fields
    if (Object.keys(filterData).length) {
        anyConditions.push({
            $and: Object.entries(filterData).map(([field, value]) => ({
                [field]: value
            }))
        });
    }


    // Filter conditions for search term
    const searchConditions = await getSearchConditions();
    anyConditions.push(...searchConditions);

    // Apply filter conditions
    const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};
    const pages = parseInt(page as string) || 1;
    const size = parseInt(limit as string) || 10;
    const skip = (pages - 1) * size;

    const result = await Booking.find(whereConditions)
        .populate("provider", "firstName lastName")
        .populate("employer", "firstName lastName")
        .skip(skip)
        .limit(size)
        .lean();
    const count = await Booking.countDocuments(whereConditions);

    const data: any = {
        result,
        meta: {
            page: pages,
            total: count
        }
    }
    return data;
}

export const BookingService = {
    createBooking,
    providerBookingFromDB,
    employerBookingFromDB,
    respondBookingToDB,
    confirmBookingToDB,
    getBookingsFormDB,
    cancelBookingToDB
}