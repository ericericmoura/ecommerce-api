import httpMocks from "node-mocks-http"

import type { Product } from "@root/prisma/generated/prisma/client.js";
import { createMockProducts, mockFindManyProduct, type GetAllProductsQueryOptional } from "@root/tests/mocks/productMocks";
import { getAllProductsController } from "@/controllers/products";
import { prismaMock } from "@/config/prismaMock";
import { Decimal } from "@prisma/client/runtime/client.js";
import { z } from "zod";

describe("Get all products", () => {
    var next = jest.fn();
    var res = httpMocks.createResponse();

    beforeEach(() => {
        jest.clearAllMocks();
        res = httpMocks.createResponse();
    })

    test("Correctly retrieves all products", async () => {
        const products = createMockProducts();

        mockFindManyProduct(products);

        const req = createGetAllProductsRequest();

        await getAllProductsController(req, res, next);

        expect(prismaMock.product.findMany).toHaveBeenCalled();

        const data = res._getJSONData().data;
        expect(data).toBeDefined();

        verifyProductsArray(data, products.length, [
            expect.objectContaining({ id: 1 }),
            expect.objectContaining({ id: 2 }),
            expect.objectContaining({ id: 3 }),
            expect.objectContaining({ id: 4 }),
        ]);

        expect(res.statusCode).toBe(200);
    });

    test("Correctly applies search filters", async () => {        
        const req = createGetAllProductsRequest({
            name: "glass",
            minPrice: 10,
            maxPrice: 20,
        });

        await getAllProductsController(req, res, next);

        expect(prismaMock.product.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    name: {
                        contains: "glass",
                        mode: "insensitive",
                    },
                    price: {
                        gte: 10,
                        lte: 20,
                    }
                }
            })
        );

        expect(res.statusCode).toBe(200);
    });

    test("Correctly applies ordering", async () => {
        const req = createGetAllProductsRequest({
            orderByCreationDate: "desc"
        });

        await getAllProductsController(req, res, next);

        expect(prismaMock.product.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: { createdAt: "desc" }
            })
        );

        expect(res.statusCode).toBe(200);
    });

    test("Correctly applies pagination", async () => {    
        const req = createGetAllProductsRequest({
            pageSize: 2,
            currentPage: 1,
        });

        await getAllProductsController(req, res, next);

        expect(prismaMock.product.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 0,
                take: 2,                  
            })
        );

        expect(res.statusCode).toBe(200);
    });

    test("Uses default pagination values", async () => {
        const req = createGetAllProductsRequest();

        await getAllProductsController(req, res, next);

        expect(prismaMock.product.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ skip: expect.any(Number), take: expect.any(Number) })
        );

        expect(res.statusCode).toBe(200);
    });

    // TEST HELPERS

    const verifyProductsArray = (data: any, length: number, expectedArr: any[]) => {
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(length);
        expect(data).toEqual(expect.arrayContaining(expectedArr));
    }

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