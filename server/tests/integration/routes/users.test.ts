describe("Users API", () => {
    describe("POST /register", () => {
        test.todo("rejects missing body fields with 422");
        test.todo("rejects invalid email format with 422");
        test.todo("rejects weak password with 422");
        test.todo("creates new user and returns 201");
        test.todo("does not return password hash or id in response");
    })
})