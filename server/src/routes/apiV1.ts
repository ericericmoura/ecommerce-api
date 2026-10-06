import express from 'express';
var router = express.Router();

import usersRoutes from "@/routes/users.js"
import cartsRoutes from "@/routes/carts.js"

// Routes
router.use("/users", usersRoutes);
router.use("/cart" , cartsRoutes);

router.get("/", (req, res) => res.status(200).json({message: `Ecommerce API v1. Running on ${req.app.get('env')}`}));

export default router;