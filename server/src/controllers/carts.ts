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
    const { productId, amount } = req.body;

    const userId = req.auth?.id;
    if (!userId) {
        return next(createHttpError(422, `User ID not provided.`));
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
        return next(createHttpError(404, `User not found.`));
    }

    const productExists = await prisma.product.findUnique({ where: { id: productId } });
    if (!productExists) {
        return next(createHttpError(404, `Product not found.`));
    }

    const cart = await prisma.cart.create({
        data: {
            productId,
            userId,
            amount
        }
    });

    res.status(201).json({ data: { productId, userId, amount, createdAt: cart.createdAt } });
}

export const removeFromCartController = async (
    req: Request<{ productId: number }, {}, {}>,
    res: Response,
    next: NextFunction
) => {
    const userId = req.auth?.id;
    if (!userId) {
        return next(createHttpError(422, "Invalid user Id."));
    }

    const { productId } = req.params;

    await prisma.cart.delete({ where: { userId_productId: { userId, productId } } });

    res.status(200).json({ message: "Cart successfully deleted." });
};