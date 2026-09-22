import jwt from "jsonwebtoken";
import env from "@/config/env.js"
import type { StringValue } from "ms";

export const generateToken = (payload: object, expirationInMinutes: string): string => {
    const exp = expirationInMinutes as StringValue;

    if (!exp)
    {
        throw Error("invalid expiration time.");
    }

    const token = jwt.sign(payload, env.JWT_SECRET, {
        issuer: env.JWT_ISSUER,
        expiresIn: exp,
    })

    return token;
}