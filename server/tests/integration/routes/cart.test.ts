import request, { Test } from "supertest";
import { app } from "@/server.js";
import { mockFindUniqueUser } from "@root/tests/mocks/userMocks.js";
import { mockFindUniqueProduct } from "@root/tests/mocks/productMocks.js";
import { prismaMock } from "@/config/prismaMock.js";
import { mockCreateCart } from "@root/tests/mocks/cartMocks.js";
import { Roles } from "@root/prisma/generated/prisma/enums.js";
import { generateToken } from "@/utils/generateToken.js";

describe("Carts API", () => {
    describe("POST /cart", () => {
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
            const payload = {id: 1, role: Roles.USER};
            const token = generateToken(payload, "5m");

            return request(app)
                .post("/api/v1/cart")
                .send(body)
                .auth(token, {type: "bearer"})
                .expect(expectedCode)
                .expect("Content-Type", /json/);
        }
    })

    describe("DELETE /register", () => {
        test.todo("rejects invalid ids with 422");

        const makeRequest = (expectedCode: number): Test => {
            const payload = { id: 1, role: Roles.USER };
            const token = generateToken(payload, "5m");

            return request(app)
                .delete(`/api/v1/cart/${1}`)
                .auth(token, { type: "bearer" })
                .expect(expectedCode)
                .expect("Content-Type", /json/);
        }
    })
})