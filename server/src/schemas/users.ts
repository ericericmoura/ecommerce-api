import { z } from "zod";

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

export const RegisterBodySchema = z.object({
    email: z.email("Invalid e-mail address"),
    username: z.string("Username must be a valid string.").min(1),
    password: z.string("Password must be a valid string.").regex(PASSWORD_REGEX, "Password must have at least 8 letters, 1 symbol, 1 uppercase letter, 1 lowercase letter, 1 number")
})