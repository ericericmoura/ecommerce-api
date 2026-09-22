import dotenv from "dotenv"
import { z } from "zod";

dotenv.config();

const rawEnv = process.env;

if (rawEnv === undefined)
{
    console.error("ERROR: no .env file could be found.");
    process.exit(1);
}

const envSchema = z.object({
    DATABASE_URL: z.url("Invalid database URL")
})

const env = envSchema.safeParse(rawEnv);
if (env.error)
{
    console.error("ERROR: failed to parse .env file");
    console.error(z.prettifyError(env.error));
    process.exit(1);
}

export default env.data;