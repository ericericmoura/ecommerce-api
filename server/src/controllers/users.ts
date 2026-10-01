import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt"

import { prisma } from "@/config/database.js";
import type { Roles } from "@root/prisma/generated/prisma/enums.js";
import { generateToken } from "@/utils/generateToken.js";
import env from "@/config/env.js"
import { email } from "zod";

export interface RegisterBody {
    email: string
    username: string
    password: string
}

export interface LoginBody {
    email: string
    password: string
}

interface UserDto {
    email: string
    username: string,
    confirmedEmail: boolean,
    role: Roles,
    isActive: boolean
}

export const registerController = async (
    req: Request<{}, {}, RegisterBody>,
    res: Response,
    next: NextFunction) => {
    const { email, username, password } = req.body

    const foundUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] }
    });
    if (foundUser) {
        return next(createHttpError(400, "e-mail or username already in use."));
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            username
        }
    })

    const token = generateToken({ id: user.id, role: user.role }, env.LOGIN_TOKEN_EXPIRATION);

    const userDTO: UserDto = {
        confirmedEmail: user.confirmedEmail,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
        username: user.username
    }

    res.status(201).json({ data: userDTO, token });
}

export const loginController = async (
    req: Request<{}, {}, LoginBody>,
    res: Response,
    next: NextFunction) => {
    const { email, password } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (!userExists) {
        return next(createHttpError(401, "Incorrect e-mail or password."));
    }

    const isPasswordValid = await bcrypt.compare(password, userExists.passwordHash);
    if (!isPasswordValid) {
        return next(createHttpError(401, "Incorrect e-mail or password."));
    }

    const token = generateToken({
        id: userExists.id,
        role: userExists.role
    }, env.LOGIN_TOKEN_EXPIRATION);

    return res.status(200).json({
        data: {
            email,
            username: userExists.username,
            confirmedEmail: userExists.confirmedEmail,
            isActive: userExists.isActive,
        },
        token,
    })
}