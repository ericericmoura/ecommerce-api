import { prismaMock } from "@/config/prismaMock.js";

export interface AddToCartBodyOptional {
    userId?: number
    productId?: number
    amount?: number
}

export const mockCreateCart = (body: AddToCartBodyOptional = {}) => {
    prismaMock.cart.create.mockResolvedValue({
        id: 1,
        userId: body.userId ?? 1,
        productId: body.productId ?? 1,
        amount: body.amount ?? 1,
        updatedAt: new Date(),
        createdAt: new Date()
    })
}