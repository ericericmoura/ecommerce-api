import createHttpError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import apiV1Router from '@/routes/apiV1.js';
import "@/middlewares/zodErrorHandler.js"
import { globalErrorHandler } from '@/middlewares/globalErrorHandler.js';

export const app = express();

// Middlewares
app.use(logger('dev'));
app.use((req, res, next) => {
    console.log("Original URL: ", req.originalUrl);
    
    if (req.originalUrl === '/api/v1/cart/checkout-completed') {
        return next();
    }
    express.json()(req, res, next);
});
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