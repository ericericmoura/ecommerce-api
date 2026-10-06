import httpMocks from "node-mocks-http"

import { prismaMock } from "@/config/prismaMock.js";
import { mockFindUniqueCart } from "@root/tests/mocks/cartMocks.js";
import { removeFromCartController } from "@/controllers/carts.js";
import { mockFindUniqueProduct } from "@root/tests/mocks/productMocks.js";
import { Roles } from "@root/prisma/generated/prisma/enums.js";

describe("Remove Products from the cart", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })

    test("rejects non-existent cart with status 404", async () => {
        mockFindUniqueProduct();

        const req = createRemoveFromCartRequest();

        await removeFromCartController(req, res, next);

        expect(prismaMock.product.findUnique).toHaveBeenCalled();
        expect(prismaMock.cart.findUnique).toHaveBeenCalled();

        expectRejection(404);
    });
    
    test("rejects non-existent product with status 404", async () => {
        const req = createRemoveFromCartRequest();

        await removeFromCartController(req, res, next);

        expect(prismaMock.product.findUnique).toHaveBeenCalled();

        expectRejection(404);
    });

    test("rejects if user trying to remove the product does not own the cart", async () => {
        mockFindUniqueProduct();
        mockFindUniqueCart(2);

        const req = createRemoveFromCartRequest();

        await removeFromCartController(req, res, next);

        expect(prismaMock.product.findUnique).toHaveBeenCalled();
        expect(prismaMock.cart.findUnique).toHaveBeenCalled();

        expectRejection(403);
    });

    test("successfully removes product from cart with 200", async () => {
        mockFindUniqueProduct();
        mockFindUniqueCart();

        const req = createRemoveFromCartRequest();

        await removeFromCartController(req, res, next);

        expect(prismaMock.product.findUnique).toHaveBeenCalled();
        expect(prismaMock.cart.findUnique).toHaveBeenCalled();

        expect(prismaMock.cart.delete).toHaveBeenCalled();

        expect(res.statusCode).toBe(200);
    });

    // TEST HELPERS

    const expectRejection = (statusCode = 400) => {
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode }));
        expect(prismaMock.cart.delete).not.toHaveBeenCalled()
    }

    const createRemoveFromCartRequest = (productId: number = 1) => {
        const req =  httpMocks.createRequest({
            method: "DELETE",
            baseUrl: "/cart",            
            body: {
                productId: productId,
            }
        });
        req.auth = {id: 1, role: Roles.USER};
        return req;
    }
})