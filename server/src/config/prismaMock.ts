import { PrismaClient } from "@root/prisma/generated/prisma/client.js";
import { mockDeep, mockReset, type DeepMockProxy } from "jest-mock-extended";

import { prisma } from "@/config/database.js";

jest.mock("./database.ts", () => ({
    __esModule: true,
    prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
    mockReset(prismaMock);
});