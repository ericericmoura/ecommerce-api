import { prisma } from "@/config/database.js";
import stripe from "@/config/stripe.js";
import { IdSchema } from "@/schemas/general.js";
import { centsToDecimal, decimalToCents } from "@/utils/decimalToCents.js";
import env from "@/config/env.js"

import { type Request, type Response, type NextFunction } from "express"
import createHttpError from "http-errors";
import type { Stripe } from "stripe";
import type { PurchaseCreateManyInput } from "@root/prisma/generated/prisma/models/Purchase";

export interface AddToCartBody {
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
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    const userId = req.auth?.id;
    if (!userId) {
        return next(createHttpError(422, "Invalid user Id."));
    }

    const id = IdSchema.parse(req.params.id);

    const cartExists = await prisma.cart.findUnique({ where: { id } });
    if (!cartExists) {
        return next(createHttpError(404, "Cart not found."));
    }
    if (cartExists.userId !== userId) {
        return next(createHttpError(403, "You don't have permission to delete this cart."));
    }
    await prisma.cart.delete({ where: { id } });

    res.sendStatus(204);
};

export const createCheckoutSessionController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.auth?.id;
    if (!id) {
        return next(createHttpError(422, "Invalid user ID."));
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return next(createHttpError(422, "Invalid user ID."));
    }

    if (!user.confirmedEmail) {
        return next(createHttpError(403, "You must confirm your e-mail address before buying."));
    }

    const carts = await prisma.cart.findMany({
        where: { userId: id },
        include: {
            product: true
        }
    });

    if (carts === undefined || carts.length === 0) {
        return next(createHttpError(400, "Cannot buy an empty cart!"));
    }

    var line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const cart of carts) {
        if (!cart.product.isActive) {
            return next(createHttpError(400, `The product with id '${cart.product.id}' is inactive.`));
        }
        if (cart.product.stock === 0) {
            return next(createHttpError(400, `The product with id '${cart.product.id}' is out of stock.`));
        }
        if (cart.amount > cart.product.stock) {
            return next(createHttpError(400, `The requested amount of the product with id '${cart.product.id}' is higher than its available stock.`));
        }
        line_items.push({
            quantity: cart.amount,
            price_data: {
                currency: "BRL",
                unit_amount: decimalToCents(cart.product.price),
                product_data: {
                    name: cart.product.name
                }
            },
            metadata: {
                id: cart.productId
            },
        })
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        ui_mode: 'hosted_page',
        success_url: `${env.SERVER_URL}/cart/success`,
        cancel_url: `${env.SERVER_URL}/cart/cancel`,
        line_items,
        billing_address_collection: 'auto',
        customer_email: user.email,
        name_collection: {
            individual: {
                enabled: true,
                optional: true,
            },
        },
        allow_promotion_codes: false,
        submit_type: 'auto',
        integration_identifier: 'hosted_web_0001',
        origin_context: 'web',
    });
    if (session.url === null) {
        return next(createHttpError(500, "Something went wrong in the URL creation."));
    }
    res.status(200).json({ redirectUrl: session.url });
}

export const checkoutCompletedController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const sig = req.headers['stripe-signature'];
        if (sig === undefined) {
            return next(createHttpError(400, "No stripe signature header provided"));
        }
        const event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SIGNING_SECRET);

        if (event.type === "checkout.session.completed") {
            if (event.data.object.customer_email === null) {
                return next(createHttpError(400, "Costumer e-mail not provided."));
            }

            const [lineItems, user] = await Promise.all([
                stripe.checkout.sessions.listLineItems(
                    event.data.object.id,
                    { limit: 100 }
                ),
                prisma.user.findUnique({ where: { email: event.data.object.customer_email } }),
            ]);

            if (!user) {
                return next(createHttpError(404, "No user with the provided e-mail."));
            }

            const carts = await prisma.cart.findMany({ where: { userId: user.id } });
            if (carts.length === 0) {
                return res.sendStatus(200);
            }

            const lineItemByProductId = new Map<number, Stripe.LineItem>();
            for (const li of lineItems.data) {
                const id = li.metadata?.["id"];
                if (id === undefined) {
                    return next(createHttpError(422, "Invalid request, one or more line items are missing metadata fields."));
                }
                lineItemByProductId.set(Number(id), li);
            }

            for (const cart of carts) {
                if (!lineItemByProductId.has(cart.productId)) {
                    return next(createHttpError(422, "Request missing one or more items from the cart."));
                }
            }

            const purchases: PurchaseCreateManyInput[] = [];
            for (const cart of carts) {
                const item = lineItemByProductId.get(cart.productId);
                if (!item) {
                    return next(createHttpError(422, "Request missing one or more items from the cart."));
                }
                purchases.push(
                    {
                        userId: user.id,
                        productId: cart.productId,
                        amount: cart.amount,
                        pricePerUnit: centsToDecimal(item.amount_total / (item.quantity ?? 1)),
                    }
                );
            }

            await prisma.$transaction([
                prisma.purchase.createMany({
                    data: purchases,
                }),
                prisma.cart.deleteMany({ where: { id: { in: carts.map(c => c.id) } } }),
                ...carts.map(c =>
                    prisma.product.update({ where: { id: c.productId }, data: { stock: { decrement: c.amount } } })
                ),
            ]);
        }
        res.sendStatus(200);
    } catch (error) {
        console.log("Error handling webhook event: ", error);
        res.sendStatus(400);
    }
}