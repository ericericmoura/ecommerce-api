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

    test("successfully removes product from cart with 200", async () => {
        mockFindUniqueProduct();
        mockFindUniqueCart();

        const req = createRemoveFromCartRequest();

        await removeFromCartController(req, res, next);

        expect(prismaMock.cart.delete).toHaveBeenCalled();

        expect(res.statusCode).toBe(200);
    });

    // TEST HELPERS

    const createRemoveFromCartRequest = (productId: number = 1) => {
        const req =  httpMocks.createRequest({
            method: "DELETE",
            baseUrl: "/cart",            
            params: {
                productId,
            }
        });
        req.auth = {id: 1, role: Roles.USER};
        return req;
    }
})