import httpMocks from "node-mocks-http"

import { prismaMock } from "@/config/prismaMock.js";
import { mockCreateCart, type AddToCartBodyOptional } from "@root/tests/mocks/cartMocks.js";
import { addToCartController } from "@/controllers/carts.js";
import { mockFindUniqueProduct } from "@root/tests/mocks/productMocks.js";
import { mockFindUniqueUser } from "@root/tests/mocks/userMocks.js";
import { Roles } from "@root/prisma/generated/prisma/browser";

describe("Remove Products from the cart", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })

    test.todo("rejects non-existent cart with status 404");
    test.todo("rejects non-existent product with status 404");
    test.todo("rejects if user trying to remove the product does not own the cart");
    test.todo("successfully removes product from cart with 200");

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