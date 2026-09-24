import express from 'express';
import { registerController } from '@/controllers/users.js';

var router = express.Router();

router.post("/register", registerController);

export default router;