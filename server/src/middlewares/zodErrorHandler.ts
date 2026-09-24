import { setGlobalOptions } from 'express-zod-safe';

setGlobalOptions({
    handler: (errors, req, res) => {
        res.status(422).json({
            message: 'Invalid request data',
            errors: errors.flatMap(({ type, errors }) =>
                errors.issues.map((issue) => ({
                    in: type,
                    field: issue.path.join('.') || undefined,
                    message: issue.message,
                }))
            ),
        });
    }
})