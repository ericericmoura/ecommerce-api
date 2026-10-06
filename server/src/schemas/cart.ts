import { z } from "zod";

export const AddToCartBodySchema = z.object({
    userId: z.number("Invalid user ID").int("User ID must be an integer").min(0),
    productId: z.number("Invalid product ID").int("Product ID must be an integer").min(0),
    amount: z.number("Invalid product amount").int("Product amount must be an integer").min(0).default(1),
});