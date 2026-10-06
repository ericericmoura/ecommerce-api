import { prismaMock } from "@/config/prismaMock.js";
import { Decimal } from "@prisma/client/runtime/client.js";

export interface CreateProductBodyOptional {
    stock?: number,
    name?: string,
    tags?: string,
    price?: Decimal,
}

export const mockFindUniqueProduct = (body: CreateProductBodyOptional = {}) => { 
    prismaMock.product.findUnique.mockResolvedValueOnce({
        id: 1,
        stock: body.stock ?? 1,
        name: body.name ?? "New Product",
        price: body.price ?? new Decimal(10),
        isActive: true,
        tags: body.tags ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
    })
}