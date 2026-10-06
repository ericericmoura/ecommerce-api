import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { verifyToken } from "@/utils/verifyToken.js";
import { Roles } from "@root/prisma/generated/prisma/enums.js";
import { prisma } from "@/config/database";

export interface AuthPayload {
    id: number;
    role: string;
}

export const authenticate = (requiredRole: Roles = Roles.ADMIN) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const header = req.headers.authorization;
        if (!header) {
            return next(createHttpError(401, "Missing authorization header"));
        }

        const [scheme, token] = header.split(" ");
        if (scheme !== "Bearer" || !token) {
            return next(createHttpError(401, "Invalid uthorization format"));
        }

        const decoded = verifyToken(token) as { id: number, role: Roles };

        if (decoded.role !== requiredRole && requiredRole === Roles.ADMIN) {
            return next(createHttpError(403, "You are not allowed to access this endpoint."));
        }

        const userExists = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!userExists || !userExists.isActive)
        {
            return next(createHttpError(401, "Account no longer exists or is inactive."));
        }

        req.auth = decoded;
        next();
    }
}