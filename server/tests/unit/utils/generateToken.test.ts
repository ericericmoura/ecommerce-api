import env from "@/config/env.js"
import jwt from "jsonwebtoken"

import { generateToken } from "@/utils/generateToken.js";
import ms from "ms";

type TokenPayload = jwt.JwtPayload & { id: number };

describe('Token Generation', () => {
    var token = "";

    beforeAll(() => {
        token = generateToken({ id: 20 }, env.LOGIN_TOKEN_EXPIRATION);
        expect(token).toBeDefined();
    })

    test('correctly generates token', () => {
        const decoded = jwt.verify(token, env.JWT_SECRET, {
            issuer: env.JWT_ISSUER
        }) as TokenPayload;

        expect(decoded.id).toBe(20);
        expect(decoded.iss).toBe(env.JWT_ISSUER);
    });
    test('rejects token with wrong secret', () => {
        expect(() => {
            jwt.verify(token, "WRONG SECRET", {
                issuer: env.JWT_ISSUER
            })
        }).toThrow();
    })
    test('rejects token with wrong issuer', () => {
        expect(() => {
            jwt.verify(token, env.JWT_SECRET, {
                issuer: "WRONG ISSUER"
            })
        }).toThrow();
    })
    test('correctly sets token expiration date', () => {
        const date = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(date);

        const decoded = jwt.verify(token, env.JWT_SECRET, {
            issuer: env.JWT_ISSUER
        }) as TokenPayload;

        const expectedExp = Math.floor((date + ms(env.LOGIN_TOKEN_EXPIRATION as ms.StringValue)) / 1000);
        expect(decoded.exp).toBe(expectedExp);
    })
    test('throw error for invalid expiration', () => {
        expect(() => generateToken({ id: 20 }, "384218uo")).toThrow();
    })
})