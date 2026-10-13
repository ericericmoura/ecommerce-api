import createHttpError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import "express-async-errors"

import apiV1Router from '@/routes/apiV1.js';
import "@/middlewares/zodErrorHandler.js"
import { globalErrorHandler } from '@/middlewares/globalErrorHandler.js';

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
app.use(globalErrorHandler);