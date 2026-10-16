import { prismaMock } from "@/config/prismaMock.js";
import { Decimal } from "@prisma/client/runtime/client.js";
import type { Product } from "@root/prisma/generated/prisma/client.js";

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

export const createMockProducts = (productsBody: CreateProductBodyOptional[] = [{}, {}, {}, {}]) => {
    const products: Product[] = [];

    var id = 1;
    for (const item of productsBody)
    {
        const product: Product = {
            id,
            name: item.name ?? "RandomProduct",
            tags: item.tags ?? "RandomTag1,RandomTag2",
            stock: item.stock ?? 2,
            price: item.price ?? Decimal(1),
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };        
        products.push(product);
        id++;
    }
    return products;
}

export const mockFindManyProduct = (products: Product[]) => {
    prismaMock.product.findMany.mockResolvedValueOnce(products);
}