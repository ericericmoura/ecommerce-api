import httpMocks from "node-mocks-http"

import { type GetAllProductsQueryOptional } from "@root/tests/mocks/cartMocks.js";

describe("Get all products", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })

    test.todo("Correctly retrieves all products");
    test.todo("Correctly applies search filters");
    test.todo("Correctly applies ordering");
    test.todo("Correctly applies pagination");
    test.todo("Uses default pagination values");

    // TEST HELPERS

    const expectRejection = (statusCode = 400) => {
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode }));
    }

    const createGetAllProductsRequest = (query: GetAllProductsQueryOptional = {}) => {
        const req = httpMocks.createRequest({
            method: "GET",
            baseUrl: "/products",
            query,
        });

        return req;
    }
})