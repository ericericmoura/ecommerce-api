import request, { Test } from "supertest";

import { app } from "@/app.js";
import { mockFindUniqueUser } from "@root/tests/mocks/userMocks.js";
import { createMockProducts, mockFindUniqueProduct } from "@root/tests/mocks/productMocks.js";
import { prismaMock } from "@/config/prismaMock.js";
import { mockCreateCart, mockFindManyCart, mockFindUniqueCart } from "@root/tests/mocks/cartMocks.js";
import { Roles } from "@root/prisma/generated/prisma/enums.js";
import { generateToken } from "@/utils/generateToken.js";
import { Prisma } from "@root/prisma/generated/prisma/client.js";

describe("Carts API", () => {
    describe("POST /cart", () => {
        test("rejects missing body fields with 422", async () => {
            mockFindUniqueUser();

            await makeRequest(422, {
                userId: 1,
                amount: 10,
            });
        });

        test("rejects invalid ids with 422", async () => {
            mockFindUniqueUser();

            await makeRequest(422, {
                userId: 2.3,
                productId: "invalidid",
                amount: 10,
            });
        });

        test("rejects same user adding same product twice with status 409", async () => {
            mockFindUniqueUser();
            mockFindUniqueUser();
            mockFindUniqueProduct();

            prismaMock.cart.create.mockRejectedValueOnce(
                new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
                    code: "P2002",
                    clientVersion: "x",
                })
            );

            await makeRequest(409, {
                userId: 1,
                productId: 1,
                amount: 10,
            });
        });

        test("adds products with 201", async () => {
            mockFindUniqueUser();
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
            const payload = { id: 1, role: Roles.USER };
            const token = generateToken(payload, "5m");

            return request(app)
                .post("/api/v1/cart")
                .send(body)
                .auth(token, { type: "bearer" })
                .expect(expectedCode)
                .expect("Content-Type", /json/);
        }
    })

    describe("DELETE /register", () => {
        test("rejects user that does not own the cart with 403", async () => {
            mockFindUniqueUser();
            mockFindUniqueCart(2, 1);

            await makeRequest(403);
        });

        test("rejects non-logged user with 401", async () => {
            mockFindUniqueCart();

            await makeRequest(401);
        });

        test("cart not found returns 404", async () => {
            mockFindUniqueUser();

            await makeRequest(404);
        });

        test("correctly deletes cart with 204", async () => {
            mockFindUniqueUser();
            mockFindUniqueCart();

            await makeRequest(204);
        });

        const makeRequest = (expectedCode: number, cartId = 1): Test => {
            const payload = { id: 1, role: Roles.USER };
            const token = generateToken(payload, "5m");

            const req = request(app)
                .delete(`/api/v1/cart/${cartId}`)
                .auth(token, { type: "bearer" })
                .expect(expectedCode)
            if (expectedCode !== 204) {
                req.expect("Content-Type", /json/);
            }
            return req;
        }
    })

    describe("GET /create-checkout-session", () => {
        test("rejects non-logged user with 401", async () => {
            await makeRequest(401);
        });

        test("correctly generates url with 200", async () => {
            mockFindUniqueUser();
            mockFindManyCart(createMockProducts());

            await makeRequest(200);
        });

        const makeRequest = (expectedCode: number): Test => {
            const payload = { id: 1, role: Roles.USER };
            const token = generateToken(payload, "5m");

            const req = request(app)
                .get(`/api/v1/cart/create-checkout-session`)
                .auth(token, { type: "bearer" })
                .expect(expectedCode)
            if (expectedCode !== 204) {
                req.expect("Content-Type", /json/);
            }
            return req;
        }
    })
})