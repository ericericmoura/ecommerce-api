import Stripe from 'stripe';
import env from "@/config/env.js"

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    typescript: true,
});

export default stripe;
