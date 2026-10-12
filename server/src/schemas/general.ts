import { z } from "zod";

export const IdSchema = z.coerce.number().positive();