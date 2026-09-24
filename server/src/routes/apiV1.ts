import express from 'express';
var router = express.Router();

import usersRoutes from "@/routes/users.js"

/* GET users listing. */
router.use("/users", usersRoutes);

export default router;