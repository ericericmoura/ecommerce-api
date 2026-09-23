import jwt from "jsonwebtoken";
import env from "@/config/env.js"

export const verifyToken = (token: string): jwt.JwtPayload => {
    const decoded = jwt.verify(token, env.JWT_SECRET, {issuer: env.JWT_ISSUER});
    return decoded as jwt.JwtPayload;
}