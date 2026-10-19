import type { Prisma } from "@root/prisma/generated/prisma/client.js";
import { Decimal } from "@prisma/client/runtime/client.js";

export const decimalToCents = (value: Prisma.Decimal): number => {
    return value.mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
}

export const centsToDecimal = (value: number): Prisma.Decimal => {
    return Decimal(value / 100);
}