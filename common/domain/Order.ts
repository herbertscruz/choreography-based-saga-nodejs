import { ObjectId } from 'mongodb';
import { isString, get, isArray, isNumber } from 'lodash';
import { OrderItem } from './OrderItem';
import { EOrderStatus } from './EOrderStatus';
import { AbstractDomain } from './AbstractDomain';

export class Order extends AbstractDomain {

    private _id: ObjectId;
    public items: OrderItem[];
    private _status: number;
    private _createdAt: number;
    private _updatedAt: number;

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

    public get status() {
        return this._status;
    }

    public set status(status: number) {
        this._status = Object.values(EOrderStatus).filter(e => isNumber(e)).find(e => e === status) as EOrderStatus;
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

    public get updatedAt() {
        return this._updatedAt;
    }

    public set updatedAt(updatedAt: number) {
        const value = new Date(updatedAt);
        if (value.getTime() > 0) {
            this._updatedAt = updatedAt;
        }
    }

    public getData(): object {
        return {
            id: this.id,
            items: this.items.map(e => e.getData()),
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }

    public static toEntity(object: object): Order {
        const entity = new Order();
        entity.id = get(object, 'id', get(object, '_id'));
        const items = get(object, 'items', []);
        if (isArray(items)) {
            entity.items = items.map(e => OrderItem.toEntity(e));
        }
        entity.status = get(object, 'status', get(object, '_status'));
        entity.createdAt = get(object, 'createdAt', get(object, '_createdAt'));
        entity.updatedAt = get(object, 'updatedAt', get(object, '_updatedAt'));
        return entity;
    }

}