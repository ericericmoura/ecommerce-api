import createHttpError, { type HttpError } from 'http-errors';
import express, {type Request, type Response} from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import "express-async-errors"
import https from "https"
import fs from "fs";

import apiV1Router from '@/routes/apiV1.js';
import "@/middlewares/zodErrorHandler.js"

export const app = express();

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API Routes
app.use('/api/v1', apiV1Router);

// 404 handler
app.use(function (req, res, next) {
  next(createHttpError(404, "endpoint could not be found."));
});

// Global error handler
app.use(function (err: HttpError, req: Request, res: Response) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// HTTPS Configuration
const privateKey = fs.readFileSync('certificate/server.key', 'utf8');
const certificate = fs.readFileSync('certificate/server.crt', 'utf8');

var credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(3000, () => {
  console.log("App listening on https://localhost:3000.");
})