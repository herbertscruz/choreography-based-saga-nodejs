export class ValidatorError extends Error {

    private _errors: object;

    constructor(errors: object) {
        super(`Validation Error ${JSON.stringify(errors)}`);
        this._errors = errors;
    }

    public get errors() {
        return this._errors;
    }
}