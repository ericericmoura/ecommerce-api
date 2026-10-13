import type { Request, Response, NextFunction } from "express";

import { prisma } from "@/config/database.js";
import type { Prisma } from "@root/prisma/generated/prisma/client.js";

export interface GetAllProductsQuery {
    name?: string,
    tags?: string[],
    minPrice?: number,
    maxPrice?: number,
    minStock?: number,
    isActive?: boolean,
    orderByCreationDate?: string,
    pageSize?: number
    currentPage?: number
}

export const getAllProductsController = async (
    req: Request<{}, {}, {}, GetAllProductsQuery>,
    res: Response,
    next: NextFunction) => {
    const { name,
        tags,
        minPrice,
        maxPrice,
        minStock,
        isActive,
        orderByCreationDate,
        pageSize,
        currentPage } = req.query;

    const take = pageSize === undefined ? 10 : Number(pageSize);
    const skip = currentPage === undefined ? 0 : (Number(currentPage) - 1) * take;

    const sort = orderByCreationDate as Prisma.SortOrder;

    const query: Prisma.ProductFindManyArgs = {
        orderBy: { createdAt: orderByCreationDate === undefined ? "desc" : sort },
        where: {
            price: {
                gte: minPrice ?? 0,
                lte: maxPrice ?? Number.MAX_SAFE_INTEGER,
            },
            name: { contains: name ?? "", mode: "insensitive" },
            ...(tags !== undefined && {
                OR: tags.map((tag) => ({
                    tags: { contains: tag, mode: "insensitive" },
                })),
            }),
            stock: {
                lte: minStock ?? 0,
            },
            isActive: isActive ?? true,
        },
        skip,
        take,
    };

    const products = await prisma.product.findMany(query);

    res.status(200).json({ data: products });
}