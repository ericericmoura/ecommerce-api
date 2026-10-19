import express from "express"
import validate from "express-zod-safe";

import { addToCartController, checkoutCompletedController, createCheckoutSessionController, removeFromCartController } from "@/controllers/carts.js";
import { AddToCartBodySchema } from "@/schemas/cart.js";
import { authenticate } from "@/middlewares/authenticationMiddleware.js";
import { Roles } from "@root/prisma/generated/prisma/enums.js";

import type { Request, Response } from "express"

const router = express.Router();

router
    .get("/create-checkout-session", authenticate(Roles.USER), createCheckoutSessionController)
    .post("/checkout-completed", express.raw({ type: "application/json" }), checkoutCompletedController)
    .get("/success", (req: Request, res: Response) => { res.status(200).json({ message: "Your purchase was successfull!" }) })
    .get("/cancel", (req: Request, res: Response) => res.status(200).json({ message: "Your purchase was canceled!" }))
    .post("/", authenticate(Roles.USER), validate({ body: AddToCartBodySchema }), addToCartController)
    .delete("/:id", authenticate(Roles.USER), removeFromCartController);

export default router;