import type { AuthPayload } from "@/middlewares/authenticationMiddleware";

declare global {
    namespace Express {
        interface Request {
            auth?: AuthPayload;
        }
    }
}