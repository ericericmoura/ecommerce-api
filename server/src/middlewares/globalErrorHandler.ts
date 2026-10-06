import { type NextFunction, type Request, type Response } from 'express';
import { type HttpError } from 'http-errors';
import { Prisma } from '@root/prisma/generated/prisma/client.js';

export const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);

    if (isPrismaError(err, "P2002")) {
        const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : undefined;
        return res.status(409).json({
            message: fields
                ? `A record with this ${fields} already exists.`
                : "This record already exists.",
        });
    }

    if (isPrismaError(err, "P2025")) {
        const model = err.meta?.modelName;
        return res.status(404).json({
            message: model ? `${model} not found.` : "The requested resource was not found.",
        });
    }

    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    const status = err.status || 500;
    
    res.status(status).json({
        message: status === 500 ? "Internal server error" : err.message,
        ...(req.app.get("env") === "development" && { stack: err.stack }),
    });
}

function isPrismaError(e: unknown, code: string): e is Prisma.PrismaClientKnownRequestError {
    return e instanceof Prisma.PrismaClientKnownRequestError && e.code === code;
}