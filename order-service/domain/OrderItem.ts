import { ObjectId } from 'mongodb';
import { isString, get } from 'lodash';
import { IDomain } from './IDomain';

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

    static toEntity(object: object): OrderItem {
        const entity = new OrderItem();
        entity.productId = get(object, 'productId');
        return entity;
    }
}