import Stripe from 'stripe';
import config from '.';

const stripe = new Stripe(config.stripe.stripeSecretKey as string, {
    apiVersion: "2025-02-24.acacia"
});

export default stripe;