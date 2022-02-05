import Validator from 'validatorjs';
import { ValidatorError } from './ValidatorError';

export abstract class AbstractDomain {

    public toString(): string {
        return JSON.stringify(this.getData());
    }

    abstract getData(): object;

    public validate(rules: object = {}): void {
        const validation = new Validator(
            this.getData(),
            rules
        );

        if (validation.fails()) {
            throw new ValidatorError(validation.errors);
        }
    }
}