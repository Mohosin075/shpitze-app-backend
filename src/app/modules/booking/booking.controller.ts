import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async(req: Request, res: Response)=>{

    const payload = {
        employer: req.user?.id,
        ...req.body
    }
    const result = await BookingService.createBooking(payload)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking Booked Successfully",
        data: result
    })
});

const employerBooking = catchAsync(async(req: Request, res: Response)=>{

    const user = req.user;
    const status = req.query.status as string;
    const result = await BookingService.employerBookingFromDB(user, status)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking Retrieved Successfully",
        data: result
    })
})

const providerBooking = catchAsync(async(req: Request, res: Response)=>{

    const user = req.user;
    const status = req.query.status as string;
    const result = await BookingService.providerBookingFromDB(user, status)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking Retrieved Successfully",
        data: result
    })
})

const respondBooking = catchAsync(async(req: Request, res: Response)=>{
    const status = req.query.status  as string;
    const result = await BookingService.respondBookingToDB(req.params.id, status)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking Status updated Successfully",
        data: result
    })
})

const confirmBooking = catchAsync(async(req: Request, res: Response)=>{
    const status = req.query.status  as string;
    const result = await BookingService.confirmBookingToDB(req.params.id, status)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking Confirm Successfully",
        data: result
    })
})

const getBookings = catchAsync(async(req: Request, res: Response)=>{
    const query = req.query;
    const result = await BookingService.getBookingsFormDB(query)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Get Bookings List Retrieved Successfully",
        data: result
    });
})

const cancelBooking = catchAsync(async(req: Request, res: Response)=>{
    const result = await BookingService.cancelBookingToDB(req.params.id)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Get Bookings List Retrieved Successfully",
        data: result
    });
})

export const BookingController = {
    createBooking,
    employerBooking,
    providerBooking,
    respondBooking,
    confirmBooking,
    getBookings,
    cancelBooking
}