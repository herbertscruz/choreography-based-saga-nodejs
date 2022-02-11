import { ObjectId } from 'mongodb';
import { isString, get } from 'lodash';
import { AbstractDomain } from './AbstractDomain';

export class Reservation extends AbstractDomain {

    private _id: ObjectId;
    private _orderId: ObjectId;
    private _productId: ObjectId;
    public quantity: number;
    public hasStock: boolean;
    private _createdAt: number;

    public get id() {
        return this._id;
    }

    public set id(id: string | ObjectId) {
        if (id instanceof ObjectId) {
            this._id = id;
        } else if (isString(id)) {
            this._id = new ObjectId(id);
        }
    }

    public get orderId() {
        return this._orderId;
    }

    public set orderId(orderId: string | ObjectId) {
        if (orderId instanceof ObjectId) {
            this._orderId = orderId;
        } else if (isString(orderId)) {
            this._orderId = new ObjectId(orderId);
        }
    }

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

    public get createdAt() {
        return this._createdAt;
    }

    public set createdAt(createdAt: number) {
        const value = new Date(createdAt);
        if (value.getTime() > 0) {
            this._createdAt = createdAt;
        }
    }

    public getData(): object {
        return {
            id: this.id,
            orderId: this.orderId,
            productId: this.productId,
            quantity: this.quantity,
            hasStock: this.hasStock,
            createdAt: this.createdAt
        }
    }

    public static toEntity(object: object): Reservation {
        const entity = new Reservation();
        entity.id = get(object, 'id', get(object, '_id'));
        entity.orderId = get(object, 'orderId', get(object, '_orderId'));
        entity.productId = get(object, 'productId', get(object, '_productId'));
        entity.quantity = get(object, 'quantity');
        entity.hasStock = Boolean(get(object, 'hasStock', ''));
        entity.createdAt = get(object, 'createdAt', get(object, '_createdAt'));
        return entity;
    }

}