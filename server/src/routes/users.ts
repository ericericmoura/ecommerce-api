import express from 'express';
import validate from 'express-zod-safe';
import { registerController } from '@/controllers/users.js';
import { RegisterBodySchema } from '@/schemas/users.js';

var router = express.Router();

router.post("/register", validate({ body: RegisterBodySchema }), registerController);

export default router;