import dotenv from "dotenv"
import { z } from "zod";

dotenv.config({quiet: true});

const rawEnv = process.env;

if (rawEnv === undefined)
{
    console.error("ERROR: no .env file could be found.");
    process.exit(1);
}

const envSchema = z.object({
    DATABASE_URL: z.url("Invalid database URL (expected provider: PostgreSQL)"),
    DIRECT_URL: z.url("Invalid direct database URL (expected provider: PostgreSQL)"),
    
    JWT_SECRET: z.string("No JWT Secret was found").min(10, "The JWT secret is too small"),
    JWT_ISSUER: z.string("No JWT Issuer was found"),

    LOGIN_TOKEN_EXPIRATION: z.string().default("15m"),
})

const env = envSchema.safeParse(rawEnv);
if (env.error)
{
    console.error("ERROR: failed to parse .env file");
    console.error(z.prettifyError(env.error));
    process.exit(1);
}

export default env.data;