import { ValidatorError } from "./ValidatorError";

export function errorHandler(err, req, res, next) {
    if (err instanceof ValidatorError) {
        res.status(422).json(err.errors);
    } else {
        const message = err.message || err.toString();
        res.status(500).json({ errors: { message } });
    }
    next();
}