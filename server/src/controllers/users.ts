import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt"

import { prisma } from "@/config/database.js";
import type { Roles } from "@root/prisma/generated/prisma/enums.js";
import { generateToken } from "@/utils/generateToken.js";
import env from "@/config/env.js"

interface RegisterBody {
    email: string
    username: string
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
    
    try {
        const user = await prisma.user.create({data: {
            email,
            passwordHash,
            username
        }})    
    
        const token = generateToken({id: user.id, role: user.role}, env.LOGIN_TOKEN_EXPIRATION);
    
        const userDTO: UserDto = {
            confirmedEmail: user.confirmedEmail,
            email: user.email,
            isActive: user.isActive,
            role: user.role,
            username: user.username
        }

        res.status(201).json({ data: userDTO, token });
    } catch (error) {
        console.log(`error: ${error}`);
        return next(createHttpError(500, "Error: " + error));
    }
}