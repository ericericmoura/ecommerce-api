import { registerController } from "@/controllers/users.js";
import { prismaMock } from "@/config/prismaMock.js";

import httpMocks from "node-mocks-http"
import { Roles } from "@root/prisma/generated/prisma/enums.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import env from "@/config/env.js"
import { verifyToken } from "@/utils/verifyToken";

interface RegisterBody {
    email?: string
    username?: string
    password?: string
}

describe("Register User", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })

    test("rejects a request with invalid or missing fields", async () => {
        const req = createRegisterRequest({ email: "321", username: "" });

        await registerController(req, res, next);

        expectRejection(422);
    })

    test("rejects a request with a weak password", async () => {
        const req = createRegisterRequest({ password: "test123" });

        await registerController(req, res, next);

        expectRejection();
    })

    test("rejects a request with an already existing e-mail", async () => {
        mockFindUser({ email: "testuser@test.com" });

        const req = createRegisterRequest({ email: "testuser@test.com" });

        await registerController(req, res, next);

        expectRejection();
    })

    test("rejects a request with an already existing username", async () => {
        mockFindUser({ username: "testuser" });

        const req = createRegisterRequest({ username: "testuser" });

        await registerController(req, res, next);

        expectRejection();
    })

    test("creates a new user on success", async () => {
        const req = createRegisterRequest({
            email: "testuser@test.com",
            username: "testuser123",
        });

        await registerController(req, res, next);

        expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                email: "testuser@test.com",
                username: "testuser123",
            })
        }));        

        expect(res.status).toHaveBeenCalledWith(201);
    })

    test("correctly hashes password", async () => {
        const password = "@MyStrongPsw123";

        const req = createRegisterRequest({ password });

        await registerController(req, res, next);

        const createCall = prismaMock.user.create.mock.calls[0]?.[0];
        expect(createCall).toBeDefined();

        const passwordHash = createCall?.data.passwordHash;
        expect(passwordHash).toBeDefined();

        expect(passwordHash).not.toBe(password);
        
        expect(await bcrypt.compare(password, passwordHash as string)).toBe(true);

        expect(res.status).toHaveBeenCalledWith(201);
    })

    test("returns a valid JWT token on success", async () => {
        const req = createRegisterRequest();

        await registerController(req, res, next);

        expect(prismaMock.user.create).toHaveBeenCalled();

        const token = (res.json as jest.Mock).mock.calls[0]?.[0].token;
        expect(token).toBeDefined();

        expect(verifyToken(token)).not.toThrow();
        expect(res.status).toHaveBeenCalledWith(201);
    })


    // TEST HELPERS
    const mockFindUser = (body: RegisterBody) => {
        prismaMock.user.findUnique.mockResolvedValueOnce({
            id: 1,
            email: body.email ?? "testuser@test.com",
            username: body.username ?? "testuser1",
            passwordHash: "@MyStrongPassword123",
            isActive: true,
            role: Roles.USER,
            confirmedEmail: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    const expectRejection = (statusCode = 400) => {
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode }));
        expect(prismaMock.user.create).not.toHaveBeenCalled()
    }

    const createRegisterRequest = (body: RegisterBody = {}) => {
        return httpMocks.createRequest({
            method: "POST",
            baseUrl: "/register",
            body: {
                email: body.email ?? "testuser@test.com",
                username: body.username ?? "testuser123",
                password: body.password ?? "@StrongPassword123",
            }
        });
    }
})