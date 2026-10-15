import httpMocks from "node-mocks-http"

import { Roles } from "@root/prisma/generated/prisma/enums.js";
import { createCheckoutSessionController } from "@/controllers/carts.js";
import { mockFindUniqueUser } from "@root/tests/mocks/userMocks.js";
import stripe from "@/config/stripe.js";

describe("Create checkout session", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })

    test("rejects empty cart with 400", async () => {
        const req = createCheckoutUrlRequest();

        mockFindUniqueUser();

        await createCheckoutSessionController(req, res, next);

        expectRejection();
    });

    test("rejects unnavailable or out of stock products with 400", async () => {
        const req = createCheckoutUrlRequest();

        mockFindUniqueUser();
        

        await createCheckoutSessionController(req, res, next);

        expectRejection();
    });

    test.todo("correctly generates url with 200");

    // TEST HELPERS

    const expectRejection = (statusCode = 400) => {
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode }));
        expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    }

    const createCheckoutUrlRequest = (userId = 1) => {
        const req = httpMocks.createRequest({
            method: "GET",
            baseUrl: "/create-checkout-session",
        });
        req.auth = { id: 1, role: Roles.USER };
        return req;
    }
})