import { prismaMock } from "@/config/prismaMock.js";
import { Roles } from "@root/prisma/generated/prisma/enums.js";
import bcrypt from "bcrypt";

export const testEmail    = "testuser@test.com";
export const testPassword = "@MyStrongPassword123";
export const testUsername = "testuser1";

export interface RegisterBodyOptional {
    email?: string
    username?: string
    password?: string
}

export const mockCreateUser = (body: RegisterBodyOptional = {}) => {
    prismaMock.user.create.mockResolvedValue({
        id: 1,
        email: body.email ?? testEmail,
        username: body.username ?? testUsername,
        passwordHash: "@MyStrongPassword123",
        isActive: true,
        role: Roles.USER,
        confirmedEmail: true,
        createdAt: new Date(),
        updatedAt: new Date()
    })
}

export const mockFindFirstUser = (body: RegisterBodyOptional = {}) => {
    prismaMock.user.findFirst.mockResolvedValueOnce(createMockUser(body));
}

export const mockFindUniqueUser = (body: RegisterBodyOptional = {}) => {
    prismaMock.user.findUnique.mockResolvedValueOnce(createMockUser());
}

const getTestPasswordHash = () => {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(testPassword, salt);
}

const createMockUser = (body: RegisterBodyOptional = {}) => {
    if (body.password == undefined) {
        body.password = getTestPasswordHash();
    }

    return {
        id: 1,
        email: body.email ?? testEmail,
        username: body.username ?? testUsername,
        passwordHash: body.password,
        isActive: true,
        role: Roles.USER,
        confirmedEmail: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
}