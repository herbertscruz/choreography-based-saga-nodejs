import { ObjectId } from 'mongodb';
import { isString, get } from 'lodash';

export class OrderItem {
    private _productId: ObjectId;

    get productId() {
        return this._productId;
    }

    set productId(productId:string|ObjectId) {

        if (productId instanceof ObjectId) {
            this._productId = productId;
        } else if(isString(productId)) {
            this._productId = new ObjectId(productId);
        }
    }

    toString(): string {
        return JSON.stringify({
            productId: this.productId
        });
    }

    static toEntity(object: object): OrderItem {
        const entity = new OrderItem();
        entity.productId = get(object, 'productId');
        return entity;
    }
}