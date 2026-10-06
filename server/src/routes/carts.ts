import express from "express"
import validate from "express-zod-safe";

import { addToCartController } from "@/controllers/carts.js";
import { AddToCartBodySchema } from "@/schemas/cart.js";

const router = express.Router();

router.post("/", validate({body: AddToCartBodySchema}), addToCartController);

export default router;