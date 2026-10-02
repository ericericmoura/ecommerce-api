import httpMocks from "node-mocks-http"

import { prismaMock } from "@/config/prismaMock.js";
import type { AddToCartBodyOptional } from "@root/tests/mocks/cartMocks.js";
import { addToCartController } from "@/controllers/carts.js";
import { mockFindUniqueProduct } from "@root/tests/mocks/productMocks.js";
import { mockFindUniqueUser } from "@root/tests/mocks/userMocks.js";
import { Prisma } from "@root/prisma/generated/prisma/client.js";

describe("Add Products to the cart", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })


    test("rejects non-existent user with status 404", async () => {
        mockFindUniqueProduct();

        const req = createAddToCartRequest();

        await addToCartController(req, res, next);

        expect(prismaMock.user.findUnique).toHaveBeenCalled();

        expectRejection(404);
    });

    test("rejects non-existent product with status 404", async () => {
        mockFindUniqueUser();

        const req = createAddToCartRequest();

        await addToCartController(req, res, next);

        expect(prismaMock.product.findUnique).toHaveBeenCalled();

        expectRejection(404);
    });

    test("rejects same user adding the same product with status 409", async () => {
        mockFindUniqueUser();
        mockFindUniqueProduct();

        const req = createAddToCartRequest();

        prismaMock.cart.create.mockRejectedValueOnce(
            new Prisma.PrismaClientKnownRequestError(
                "Unique constraint failed on the fields: (`userId`,`productId`)",
                { code: "P2002", clientVersion: "test" }
            )
        );

        await addToCartController(req, res, next);

        expect(prismaMock.product.findUnique).toHaveBeenCalled();
        expect(prismaMock.user.findUnique).toHaveBeenCalled();

        expect(prismaMock.cart.create).toThrow();

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
    });


    test("correctly adds product with status 201", async () => {
        mockFindUniqueUser();
        mockFindUniqueProduct();

        const req = createAddToCartRequest();

        await addToCartController(req, res, next);

        const data = res._getJSONData().data;
        expect(data).toBeDefined();
        expect(data).toHaveProperty("userId");
        expect(data).toHaveProperty("productId");
        expect(data).toHaveProperty("amount");

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 200 }));
    });

    test("does not return ID on success", async () => {
        mockFindUniqueUser();
        mockFindUniqueProduct();

        const req = createAddToCartRequest();

        await addToCartController(req, res, next);

        const data = res._getJSONData().data;
        expect(data).toBeDefined();
        expect(data).not.toHaveProperty("id");

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 200 }));
    });

    // TEST HELPERS

    const expectRejection = (statusCode = 400) => {
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode }));
        expect(prismaMock.cart.create).not.toHaveBeenCalled()
    }

    const createAddToCartRequest = (body: AddToCartBodyOptional = {}) => {
        return httpMocks.createRequest({
            method: "POST",
            baseUrl: "/cart",
            body: {
                userId: body.amount ?? 1,
                productId: body.userId ?? 1,
                amount: body.productId ?? 5,
            }
        });
    }
})