import request, { Test } from "supertest";
import { app } from "@/app.js";
import { createMockProducts, mockFindManyProduct } from "@root/tests/mocks/productMocks.js";
import { Decimal } from "@prisma/client/runtime/client.js";
import { prismaMock } from "@/config/prismaMock.js";

describe("GET /", () => {
    test("correctly returns filtered products with 200", async () => {
        const products = createMockProducts([
            { name: "glass", price: Decimal(10.99) },
            { name: "red glasses", price: Decimal(15.99) },
            { name: "green glasses", price: Decimal(12.99) },
            { name: "black glasses with golden frame", price: Decimal(29.99) },
        ]);

        mockFindManyProduct(products);

        const query = {
            minPrice: 10,
            maxPrice: 20,
            name: "glass",
        }

        mockFindManyProduct([
            { id: 1, name: "glass", price: Decimal(10.99), isActive: true, createdAt: new Date(), updatedAt: new Date(), stock: 0, tags: "" },
            { id: 1, name: "red glasses", price: Decimal(15.99), isActive: true, createdAt: new Date(), updatedAt: new Date(), stock: 0, tags: "" },
            { id: 1, name: "green glasses", price: Decimal(12.99), isActive: true, createdAt: new Date(), updatedAt: new Date(), stock: 0, tags: "" },
        ]);

        const res = await makeRequest(200, query);

        expect(res.body.data).toBeDefined();
        expect(res.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: "glass" }),
            expect.objectContaining({ name: "red glasses" }),
            expect.objectContaining({ name: "green glasses" }),
        ]));
    });

    test.each([
        ["negative minPrice", { minPrice: -1 }],
        ["negative maxPrice", { maxPrice: -1 }],
        ["invalid ordering value", { orderByCreationDate: "invalidOrdering" }],
        ["pageSize lower than 1", { pageSize: 0 }],
        ["currentPage lower than 1", { currentPage: 0 }],
    ],)("rejects %s with 422", async (_, query) => {
        await makeRequest(422, query);
    })

    test("applies default pagination", async () => {
        await makeRequest(200, {});

        expect(prismaMock.product.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ skip: expect.any(Number), take: expect.any(Number) })
        );
    })

    const makeRequest = (expectedCode: number, query: object): Test => {
        return request(app)
            .get("/api/v1/products")
            .query(query)
            .expect(expectedCode)
            .expect("Content-Type", /json/);
    }
})