import { prismaMock } from "@/config/prismaMock.js";
import type { Prisma, Product } from "@root/prisma/generated/prisma/client.js";

export interface AddToCartBodyOptional {
    userId?: number
    productId?: number
    amount?: number
}

const createMockCart = (body: AddToCartBodyOptional = {}) => {
    return {
        id: 1,
        userId: body.userId ?? 1,
        productId: body.productId ?? 1,
        amount: body.amount ?? 1,
        updatedAt: new Date(),
        createdAt: new Date()
    };
}


export const mockCreateCart = (body: AddToCartBodyOptional = {}) => {
    prismaMock.cart.create.mockResolvedValue(createMockCart(body));
}

export const mockFindUniqueCart = (userId: number = 1, productId: number = 1) => {
    prismaMock.cart.findUnique.mockResolvedValueOnce(createMockCart({ userId, productId }));
}

type CartWithProduct = Prisma.CartGetPayload<{ include: { product: true } }>

export const mockFindManyCart = (products: Product[], userId = 1, invalid = false) => {
    var id = 1;

    const carts: CartWithProduct[] = products.map(product => (
        {
            id: id++,
            productId: product.id,        
            amount: !invalid ? product.stock-1 : product.stock+1,
            userId,
            product,            
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ))

    prismaMock.cart.findMany.mockResolvedValueOnce(carts);
}