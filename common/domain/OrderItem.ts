import { ObjectId } from 'mongodb';
import { isString, get } from 'lodash';
import { AbstractDomain } from './AbstractDomain';

export class OrderItem extends AbstractDomain {

    private _productId: ObjectId;
    public unitPrice: number;
    public quantity: number;

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

    public getData(): object {
        return {
            productId: this.productId,
            unitPrice: this.unitPrice,
            quantity: this.quantity
        };
    }

    public static toEntity(object: object): OrderItem {
        const entity = new OrderItem();
        entity.productId = get(object, 'productId', get(object, '_productId'));
        entity.unitPrice = get(object, 'unitPrice');
        entity.quantity = get(object, 'quantity');
        return entity;
    }

}