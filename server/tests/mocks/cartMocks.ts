import { prismaMock } from "@/config/prismaMock.js";

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
    prismaMock.cart.findUnique.mockResolvedValueOnce(createMockCart({userId, productId}));
}