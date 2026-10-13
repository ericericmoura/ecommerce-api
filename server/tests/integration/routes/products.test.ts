import request, { Test } from "supertest";
import { app } from "@/server.js";

describe("GET /", () => {
    test.todo("correctly returns filtered products with 200");
    test.todo("rejects invalid query params with 422");

    test.skip.each([
        ["negative minPrice", { minPrice: -1 }],
        ["negative maxPrice", { maxPrice: -1 }],
        ["invalid ordering value", { orderByCreationDate: "invalidOrdering" }],
        ["pageSize lower than 1", { pageSize: 0 }],
        ["currentPage lower than 1", { currentPage: 0 }],
    ],)("rejects %i with 422", async (_, query) => {})

    const makeRequest = (expectedCode: number, query: object): Test => {
        return request(app)
            .get("/api/v1/products")
            .query(query)
            .expect(expectedCode)
            .expect("Content-Type", /json/);
    }
})