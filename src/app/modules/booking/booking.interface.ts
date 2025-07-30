import { Model, Types } from "mongoose";

export type IBooking = {
    employer: Types.ObjectId;
    provider: Types.ObjectId;
    status: 'Pending' | "Reject" | "Cancel" | "Accept" | "Complete";
    paymentStatus: 'Pending' | "Paid" | "Refund";
    bookingSystem: 'instant_booking' | 'request_booking';
    category: String;
    schedule: [String];
    price: Number;
    rateType: 'Hour' | 'Daily';
    transactionId: String;
    sessionId?:string;
}

export type BookingModel = Model<IBooking>;