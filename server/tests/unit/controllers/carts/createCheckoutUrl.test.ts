import httpMocks from "node-mocks-http"

import { Roles } from "@root/prisma/generated/prisma/enums.js";

describe("Add Products to the cart", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })

    test.todo("rejects non-logged user with 403");
    test.todo("rejects empty cart with 400");
    test.todo("rejects unnavailable or out of stock products with 400");
    test.todo("correctly generates url with 200");

    // TEST HELPERS

    const expectRejection = (statusCode = 400) => {
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode }));
    }

    const createCheckoutUrlRequest = (userId = 1) => {
        const req = httpMocks.createRequest({
            method: "GET",
            baseUrl: "/create-checkout-url",
        });
        req.auth = { id: 1, role: Roles.USER };
        return req;
    }
})