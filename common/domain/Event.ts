import { ObjectId } from 'mongodb';
import { isString, get } from 'lodash';
import { AbstractDomain } from './AbstractDomain';

export class Event extends AbstractDomain {

    private _id: ObjectId;
    private _orderId: ObjectId;
    public routingKey: string;
    public metadata: object;
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
            routingKey: this.routingKey,
            metadata: this.metadata,
            createdAt: this.createdAt
        }
    }

    public static toEntity(object: object): Event {
        const entity = new Event();
        entity.id = get(object, 'id', get(object, '_id'));
        entity.orderId = get(object, 'orderId', get(object, '_orderId'));
        entity.routingKey = get(object, 'routingKey');
        entity.metadata = get(object, 'metadata');
        entity.createdAt = get(object, 'createdAt', get(object, '_createdAt'));
        return entity;
    }

}