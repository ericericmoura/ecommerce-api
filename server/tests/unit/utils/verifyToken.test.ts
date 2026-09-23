import type { JwtPayload } from "jsonwebtoken";
import ms from "ms";

import { generateToken } from "@/utils/generateToken.js";
import { verifyToken } from "@/utils/verifyToken.js";
import env from "@/config/env.js"

describe("Verify Token", () => {
    test("correctly verifies token", () => {
        const token = generateToken({id: 12}, "10m");        

        var decoded: JwtPayload = {};
        expect(() => decoded = verifyToken(token)).not.toThrow();

        expect(decoded.iss).toBe(env.JWT_ISSUER);
        expect(Number(decoded.exp)).toBe(Math.floor((Date.now() + ms("10m")) / 1000));
        expect((decoded as {id: number}).id).toBe(12);
    })
})