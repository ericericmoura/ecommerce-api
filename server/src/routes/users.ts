import express from 'express';
import validate from 'express-zod-safe';
import { loginController, registerController } from '@/controllers/users.js';
import { LoginBodySchema, RegisterBodySchema } from '@/schemas/users.js';

var router = express.Router();

router.post("/register", validate({ body: RegisterBodySchema }), registerController)
      .post("/login", validate({ body: LoginBodySchema }), loginController);

export default router;