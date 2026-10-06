import { prisma } from "@/config/database.js";

import { type Request, type Response, type NextFunction } from "express"
import createHttpError from "http-errors";

export interface AddToCartBody {
    userId: number,
    productId: number,
    amount: number,
}

export const addToCartController = async (
    req: Request<{}, {}, AddToCartBody>,
    res: Response,
    next: NextFunction
) => {
    const {userId, productId, amount} = req.body;

    const userExists = await prisma.user.findUnique({where: {id: userId}});
    if (!userExists)
    {
        return next(createHttpError(404, `User not found.`));
    }

    const productExists = await prisma.product.findUnique({ where: { id: productId } });
    if (!productExists) {
        return next(createHttpError(404, `Product not found.`));
    }

    const cart = await prisma.cart.create({data: {
        productId,
        userId,
        amount        
    }});        

    res.status(201).json({ data: { productId, userId, amount, createdAt: cart.createdAt}});
}