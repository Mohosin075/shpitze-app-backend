import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import { JwtPayload } from "jsonwebtoken";
import stripe from "../../../config/stripe";
import { Booking } from "../booking/booking.model";

const createCheckoutPaymentInDB = async (user: JwtPayload, payload: any): Promise<string | null> => {
    const { price, service, id } = payload;

    if (typeof price !== "number" || price <= 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid price amount");
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: service,
                    },
                    unit_amount: Math.trunc(price * 100),
                },
                quantity: 1,
            },
        ],
        customer_email: user?.email,
        success_url: "http://10.0.80.75:6008/success",
        cancel_url: "http://10.0.80.75:6008/failed"
    });

    if (!session) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Payment Checkout");
    } else {

        await Booking.findOneAndUpdate(
            { _id: id },
            { sessionId: session.id },
            { new: true }
        );
    }

    return session?.url;
};

const createAccountToStripe = async (user: JwtPayload) => {
    // Check if this user exists
    const existingUser: any = await User.findById(user.id).select("+accountInformation").lean();
    if (existingUser?.accountInformation?.accountUrl) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You already connected your bank on Stripe.");
    }

    // Create account for Canada
    const account = await stripe.accounts.create({
        type: "express",
        country: "CA",
        email: user?.email,
        business_type: "individual",
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
        individual: {
            first_name: existingUser?.firstName,
            last_name: existingUser?.lastName,
            email: existingUser?.email,
        },
        business_profile: {
            mcc: "7299",
            product_description: "Freelance services on demand",
            url: "https://yourplatform.com",
        },
    });

    if (!account) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create account.");
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'http://10.0.80.75:6008/failed',
        return_url: 'https://10.0.80.75:6008/success',
        type: 'account_onboarding',
    });

    // Update the user account with the Stripe account ID
    const updateAccount = await User.findOneAndUpdate(
        { _id: user.id },
        { "accountInformation.stripeAccountId": account.id },
        { new: true }
    );

    if (!updateAccount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update account.");
    }

    return accountLink?.url; // Return the onboarding link
}


export const PaymentService = {
    createCheckoutPaymentInDB,
    createAccountToStripe
}