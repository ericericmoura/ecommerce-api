import httpMocks from "node-mocks-http"

import { verifyToken } from "@/utils/verifyToken.js";
import { loginController } from "@/controllers/users.js";
import { mockFindUser, testEmail, testPassword, type RegisterBodyOptional } from "@root/tests/mocks/userMocks.js";
import { generateToken } from "@/utils/generateToken.js";

describe("Register User", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })

    test("rejects a request with an non-existing e-mail", async () => {
        const req = createLoginRequest();

        await loginController(req, res, next);

        expectRejection(404);
    })

    test("rejects a request with a wrong password", async () => {
        mockFindUser();

        const req = createLoginRequest({password: "WrongPassword"});

        await loginController(req, res, next);

        expectRejection(401);
    })

    test("returns a valid JWT token on success", async () => {
        mockFindUser();

        const req = createLoginRequest();

        await loginController(req, res, next);

        const token = res._getJSONData().token;
        expect(token).toBeDefined();        

        var decoded;
        expect(() => decoded = verifyToken(token)).not.toThrow();

        expect(decoded).toHaveProperty("id");
        expect(decoded).toHaveProperty("role");

        expect(res.statusCode).toBe(200);
    })

    test("does not return password in response", async () => {
        mockFindUser();

        const req = createLoginRequest();

        await loginController(req, res, next);

        const data = res._getJSONData().data;
        expect(data).toBeDefined();

        expect(data).not.toHaveProperty("id");
        expect(data).not.toHaveProperty("password");
        expect(data).not.toHaveProperty("passwordHash");
        
        expect(res.statusCode).toBe(200);
    });

    // TEST HELPERS

    const expectRejection = (statusCode = 400) => {
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode }));
        expect(generateToken).not.toHaveBeenCalled();
    }

    const createLoginRequest = (body: RegisterBodyOptional = {}) => {
        return httpMocks.createRequest({
            method: "POST",
            baseUrl: "/login",
            body: {
                email: body.email ?? testEmail,
                password: body.password ?? testPassword,
            }
        });
    }
})