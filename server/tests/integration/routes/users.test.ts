import request, { Test } from "supertest";
import { app } from "@/server.js";
import { verifyToken } from "@/utils/verifyToken.js";
import { mockCreateUser } from "@root/tests/mocks/userMocks.js";

describe("Users API", () => {
    describe("POST /register", () => {        
        test("rejects missing body fields with 422", async () => {
            await makeRequest(422, {
                email: "testuser@test.com",
                password: "@StrongPassword123"
            });       
        });
        test("rejects invalid email format with 422", async () => {
            await makeRequest(422, {
                email: "testuser.test.com",
                username: "testuser12",
                password: "StrongPassword123"
            });
        });
        test("rejects weak password with 422", async () => {
            await makeRequest(422, {
                email: "testuser@test.com",
                username: "testuser12",
                password: "weakpsw1"
            });
        });
        test("creates new user and returns 201", async () => {
            mockCreateUser();

            const res = makeRequest(201, {
                email: "testuser@test.com",
                username: "testuser12",
                password: "@StrongPassword123"
            });

            const body = (await res).body;

            expect(body.data.username).toBeDefined();
            expect(body.token).toBeDefined();

            expect(() => verifyToken(body.token)).not.toThrow();
        });

        const makeRequest = (expectedCode: number, body: object): Test => {          
            return request(app)
                .post("/api/v1/users/register")
                .send(body)
                .expect(expectedCode)                   
                .expect("Content-Type", /json/);
        }
    })
})