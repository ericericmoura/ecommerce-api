import { z } from "zod";

export const GetAllProductsQuerySchema = z.object({
    name: z.string("Name must be a string").optional(),
    tags: z.string("Tags must be a string[]").array().optional(),
    minPrice: z.coerce.number("minPrice must be a number").int("minPrice must be an integer").positive("minPrice must be positive").optional(),
    maxPrice: z.coerce.number("maxPrice must be a number").int("maxPrice must be an integer").positive("maxPrice must be positive").optional(),
    minStock: z.coerce.number("minStock must be a number").int("minStock must be an integer").positive("minStock must be positive").optional(),
    isActive: z.boolean("isActive must be a boolean").default(true),
    orderByCreationDate: z.enum(["asc", "desc"], "orderByCreationDate can be either 'asc' or 'desc'").default("desc"),
    pageSize: z.coerce.number("pageSize must be a number").int("pageSize must be an integer").min(1).positive("pageSize must be positive").default(10),
    currentPage: z.coerce.number("currentPage must be a number").int("currentPage must be an integer").min(1).positive("currentPage must be positive").default(1),
});