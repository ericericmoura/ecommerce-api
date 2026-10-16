import { z } from "zod";

export const AddToCartBodySchema = z.object({
    productId: z.number("Invalid product ID").int("Product ID must be an integer").min(0),
    amount: z.number("Invalid product amount").int("Product amount must be an integer").min(0).default(1),
});