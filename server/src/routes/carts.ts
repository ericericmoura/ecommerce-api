import express from "express"
import validate from "express-zod-safe";

import { addToCartController, removeFromCartController } from "@/controllers/carts.js";
import { AddToCartBodySchema } from "@/schemas/cart.js";
import { authenticate } from "@/middlewares/authenticationMiddleware.js";
import { Roles } from "@root/prisma/generated/prisma/enums.js";

const router = express.Router();

router
    .post  ("/", authenticate(Roles.USER), validate({body: AddToCartBodySchema}), addToCartController)
    .delete("/:id", authenticate(Roles.USER), removeFromCartController);

export default router;