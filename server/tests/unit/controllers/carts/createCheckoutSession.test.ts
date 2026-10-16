import httpMocks from "node-mocks-http"

import { Roles } from "@root/prisma/generated/prisma/enums.js";
import { createCheckoutSessionController } from "@/controllers/carts.js";
import stripe from "@/config/stripe.js";
import { createMockProducts } from "@root/tests/mocks/productMocks.js";
import { mockFindManyCart } from "@root/tests/mocks/cartMocks.js";

const mockCreate = jest.fn();

jest.mock("@/config/stripe.js", () => ({
    __esModule: true,
    default: {
        checkout: {
            sessions: {
                create: (...args: unknown[]) => mockCreate(...args),
            },
        },
    },
}));


describe("Create checkout session", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();

        mockCreate.mockResolvedValue({ url: 'https://mocked-stripe-response-url' });
    })

    test("rejects empty cart with 400", async () => {
        const req = createCheckoutUrlRequest();

        await createCheckoutSessionController(req, res, next);

        expectRejection();
    });

    test("rejects unnavailable or out of stock products with 400", async () => {
        const req = createCheckoutUrlRequest();

        mockFindManyCart(createMockProducts(), 1, true);

        await createCheckoutSessionController(req, res, next);

        expectRejection();
    });

    test("correctly generates url with 200", async () => {
        const req = createCheckoutUrlRequest();

        mockFindManyCart(createMockProducts());

        await createCheckoutSessionController(req, res, next);

        const redirectUrl = res._getJSONData().redirectUrl;
        expect(redirectUrl).toBeDefined();

        expect(res.statusCode).toBe(200);

        expect(mockCreate).toHaveBeenCalled();
    });

    // TEST HELPERS

    const expectRejection = (statusCode = 400) => {
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode }));
        expect(mockCreate).not.toHaveBeenCalled();
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