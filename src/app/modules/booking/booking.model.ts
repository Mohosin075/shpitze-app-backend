import { model, Schema } from "mongoose";
import { IBooking, BookingModel } from "./booking.interface"

const bookingSchema = new Schema<IBooking, BookingModel>(
    {
        employer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Reject", "Accept", "Cancel", "Complete"],
            default: "Pending"
        },
        bookingSystem: {
            type: String,
            enum: ["instant_booking", "request_booking"],
            required: true
        },
        schedule: [],
        category: {
            type: String,
            required: true
        },
        rateType: {
            type: String,
            enum: ["Hour", "Daily"],
            default: "Hour"
        },
        transactionId: {
            type: String,
            require: true
        },
        paymentStatus: {
            type : String,
            enum: ["Pending", "Paid", "Refund"],
            default: "Pending"
        },
        sessionId: {
            type: String,
            required: false
        },
    },
    {timestamps: true}
);

export const Booking = model<IBooking, BookingModel>("Booking", bookingSchema);