import { registerController } from "@/controllers/users.js";
import { prismaMock } from "@/config/prismaMock.js";

import httpMocks, { createResponse } from "node-mocks-http"
import { Roles } from "@root/prisma/generated/prisma/enums.js";
import { create } from "domain";

interface RegisterBody 
{
    email   ?: string
    username?: string
    password?: string
}

describe("Register User", () => {
    var next = jest.fn();
    var res  = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })

    test("rejects a request with invalid or missing fields", async () => {
        const req = createRegisterRequest({email: "321", username: ""});

        await registerController(req, res, next);
        
        expectRejection(422);
    })

    test("rejects a request with a weak password", async () => {
        const req = createRegisterRequest({ password: "test123" });

        await registerController(req, res, next);

        expectRejection();
    })

    test("rejects a request with an already existing e-mail", async () => {
        mockFindUser({email: "testuser@test.com"});
        
        const req = createRegisterRequest({ email: "testuser@test.com" });

        await registerController(req, res, next);

        expectRejection();
    })

    test("rejects a request with an already existing username", async () => {
        mockFindUser({username: "testuser"});

        const req = createRegisterRequest({ username: "testuser" });

        await registerController(req, res, next);

        expectRejection();
    })

    test.todo("creates a new user on success")
    test.todo("returns a valid JWT token on success")

    
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

    const createRegisterRequest = (body: RegisterBody) => {
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