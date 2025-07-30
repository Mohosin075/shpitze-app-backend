import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import ApiError from '../errors/ApiError';
import { Booking } from '../app/modules/booking/booking.model';

export const handleCheckoutSession = async (data: Stripe.Checkout.Session) => {

    // Retrieve the subscription from Stripe
    const session = await stripe.checkout.sessions.retrieve(data?.id);

    if (session.payment_status === "paid") {
        await Booking.findOneAndUpdate(
            { sessionId: session.id },
            { paymentStatus: "Paid" },
            { new: true }
        );
    } else {
        throw new ApiError(StatusCodes.NOT_FOUND, `Payment Checkout Session not found.`);
    }
}