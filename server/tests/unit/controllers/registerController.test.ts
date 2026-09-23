import bcrypt from "bcrypt"
import httpMocks from "node-mocks-http"

import { Roles } from "@root/prisma/generated/prisma/enums.js";
import { verifyToken } from "@/utils/verifyToken.js";
import { registerController } from "@/controllers/users.js";
import { prismaMock } from "@/config/prismaMock.js";

interface RegisterBody {
    email?: string
    username?: string
    password?: string
}

describe("Register User", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    var testEmail = "testuser@test.com";
    var testUsername = "testuser1";

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })

    test("rejects a request with an already existing e-mail", async () => {
        mockFindUser({ email: testEmail });

        const req = createRegisterRequest({ email: testEmail });

        await registerController(req, res, next);

        expectRejection();
    })

    test("rejects a request with an already existing username", async () => {
        mockFindUser({ username: testUsername });

        const req = createRegisterRequest({ username: testUsername });

        await registerController(req, res, next);

        expectRejection();
    })

    test("creates a new user on success", async () => {
        mockCreateResolvedValue();

        const req = createRegisterRequest();

        await registerController(req, res, next);

        expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                email: testEmail,
                username: testUsername,
            })
        }));        

        expect(res.statusCode).toBe(201);
    })

    test("correctly hashes password", async () => {
        mockCreateResolvedValue();

        const password = "@MyStrongPsw123";

        const req = createRegisterRequest({ password });

        await registerController(req, res, next);

        const createCall = prismaMock.user.create.mock.calls[0]?.[0];
        expect(createCall).toBeDefined();

        const passwordHash = createCall?.data.passwordHash;
        expect(passwordHash).toBeDefined();

        expect(passwordHash).not.toBe(password);
        
        expect(await bcrypt.compare(password, passwordHash as string)).toBe(true);

        expect(res.statusCode).toBe(201);
    })

    test("returns a valid JWT token on success", async () => {
        mockCreateResolvedValue();

        const req = createRegisterRequest();

        await registerController(req, res, next);

        expect(prismaMock.user.create).toHaveBeenCalled();

        const token = res._getJSONData().token;
        expect(token).toBeDefined();

        expect(() => verifyToken(token)).not.toThrow();
        expect(res.statusCode).toBe(201);
    })


    // TEST HELPERS
    const mockCreateResolvedValue = (body: RegisterBody = {}) => {
        prismaMock.user.create.mockResolvedValue({
            id: 1,
            email: body.email ?? testEmail,
            username: body.username ?? testUsername,
            passwordHash: "@MyStrongPassword123",
            isActive: true,
            role: Roles.USER,
            confirmedEmail: true,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    const mockFindUser = (body: RegisterBody) => {
        prismaMock.user.findFirst.mockResolvedValueOnce({
            id: 1,
            email: body.email ?? testEmail,
            username: body.username ?? testUsername,
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
                email: body.email ?? testEmail,
                username: body.username ?? testUsername,
                password: body.password ?? "@StrongPassword123",
            }
        });
    }
})