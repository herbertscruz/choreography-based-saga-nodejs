import { ObjectId } from 'mongodb';
import { isString, get } from 'lodash';
import { IDomain } from './IDomain';
import Validator from 'validatorjs';
import { ValidatorError } from './ValidatorError';

export class OrderItem implements IDomain {

    private _productId: ObjectId;

    public get productId() {
        return this._productId;
    }

    public set productId(productId:string|ObjectId) {
        if (productId instanceof ObjectId) {
            this._productId = productId;
        } else if(isString(productId)) {
            this._productId = new ObjectId(productId);
        }
    }

    public toString(): string {
        return JSON.stringify(this.getData());
    }

    public getData(): object {
        return {
            productId: this.productId
        };
    }

    public static toEntity(object: object): OrderItem {
        const entity = new OrderItem();
        entity.productId = get(object, 'productId', get(object, '_productId'));
        return entity;
    }

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