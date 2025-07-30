import stripe from '../config/stripe';
import Stripe from 'stripe';
import { StatusCodes } from 'http-status-codes';
import { User } from '../app/modules/user/user.model';
import ApiError from '../errors/ApiError';

export const handleAccountConnectEvent = async (data: Stripe.Account) => {

    // Find the user by Stripe account ID
    const existingUser = await User.findOne({
        'accountInformation.stripeAccountId': data.id,
    });

    if (!existingUser) {
        // throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
        return 'User not found'
    }

    // Check if the onboarding is complete
    if (data.charges_enabled) {
        const loginLink = await stripe.accounts.createLoginLink(data.id);

        console.log('Login link:', loginLink.url);

        // Save Stripe account information to the user record
        await User.findByIdAndUpdate(
            { _id: existingUser?._id },
            {
                $set: {
                    'accountInformation.stripeAccountId': data.id,
                    'accountInformation.status': true,
                    'accountInformation.externalAccountId': data.external_accounts?.data[0]?.id || '',
                    'accountInformation.currency': data.default_currency || '',
                    'accountInformation.accountUrl': loginLink.url,
                }
            },
            { new: true }
        );
    }
};
