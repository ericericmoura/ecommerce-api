import request, { Test } from "supertest";
import { app } from "@/server.js";
import { mockFindUniqueUser } from "@root/tests/mocks/userMocks.js";
import { mockFindUniqueProduct } from "@root/tests/mocks/productMocks.js";
import { prismaMock } from "@/config/prismaMock.js";
import { mockCreateCart } from "@root/tests/mocks/cartMocks.js";

describe("Users API", () => {
    describe("POST /register", () => {
        test("rejects missing body fields with 422", async () => {
            await makeRequest(422, {
                userId: 1,
                amount: 10,                
            });
        });

        test("rejects invalid ids with 422", async () => {
            await makeRequest(422, {
                userId: 2.3,
                productId: "invalidid",
                amount: 10,
            });
        });

        test("rejects same user adding same product twice with status 409", async () => {
            mockFindUniqueUser();
            mockFindUniqueProduct();

            prismaMock.cart.create.mockRejectedValueOnce(
                { code: "P2002" }
            );

            expect(prismaMock.cart.create).toThrow();

            await makeRequest(409, {
                userId: 1,
                productId: 1,
                amount: 10,
            });
        });

        test("adds products with 201", async () => {
            mockFindUniqueUser();
            mockFindUniqueProduct();

            mockCreateCart();

            await makeRequest(201, {
                userId: 1,
                productId: 1,
                amount: 10,
            });
        });

        const makeRequest = (expectedCode: number, body: object): Test => {
            return request(app)
                .post("/api/v1/cart")
                .send(body)
                .expect(expectedCode)
                .expect("Content-Type", /json/);
        }
    })
})