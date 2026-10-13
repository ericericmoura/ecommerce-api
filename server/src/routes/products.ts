import { getAllProductsController } from '@/controllers/products.js';
import { GetAllProductsQuerySchema } from '@/schemas/products.js';
import express from 'express';
import validate from 'express-zod-safe';

var router = express.Router();

router.get("/", validate({ query: GetAllProductsQuerySchema }), getAllProductsController);

export default router;