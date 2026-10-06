import { type NextFunction, type Request, type Response } from 'express';
import { type HttpError } from 'http-errors';

export const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);

    if (isPrismaUniqueError(err)) {
        return res.status(409).json({
            message: "Resource already exists",
            target: err.meta?.target,
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

function isPrismaUniqueError(e: unknown): e is { code: "P2002"; meta?: { target?: unknown } } {
    return typeof e === "object" && e !== null && (e as any).code === "P2002";
}