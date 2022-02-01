import { ObjectId } from 'mongodb';
import { isString, get, isArray, isNumber } from 'lodash';
import { OrderItem } from './OrderItem';
import { EOrderStatus } from './EOrderStatus';

export class Order {
    private _id: ObjectId;
    items: OrderItem[];
    private _status: number;
    private _createdAt: number;
    private _updatedAt: number;

    get id() {
        return this._id;
    }

    set id(id: string | ObjectId) {
        if (id instanceof ObjectId) {
            this._id = id;
        } else if (isString(id)) {
            this._id = new ObjectId(id);
        }
    }

    get status() {
        return this._status;
    }

    set status(status: number) {
        this._status = Object.values(EOrderStatus).filter(e => isNumber(e)).find(e => e === status) as EOrderStatus;
    }

    get createdAt() {
        return this._createdAt;
    }

    set createdAt(createdAt: number) {
        const value = new Date(createdAt);
        if (value.getTime() > 0) {
            this._createdAt = createdAt;
        }
    }

    get updatedAt() {
        return this._updatedAt;
    }

    set updatedAt(updatedAt: number) {
        const value = new Date(updatedAt);
        if (value.getTime() > 0) {
            this._updatedAt = updatedAt;
        }
    }

    toString(): string {
        return JSON.stringify({
            id: this.id,
            items: this.items.map(e => JSON.parse(e.toString())),
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        });
    }

    static toEntity(object: object): Order {
        const entity = new Order();
        entity.id = get(object, 'id', get(object, '_id'));
        const items = get(object, 'items', []);
        if (isArray(items)) {
            entity.items = items.map(e => {
                const subEntity = new OrderItem();
                subEntity.productId = get(e, 'productId');
                return subEntity;
            });
        }
        entity.status = get(object, 'status');
        entity.createdAt = get(object, 'createdAt');
        entity.updatedAt = get(object, 'updatedAt');
        return entity;
    }
}