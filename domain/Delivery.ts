import { ObjectId } from 'mongodb';
import { isString, get, isNumber } from 'lodash';
import { EPaymentStatus } from './EPaymentStatus';
import { AbstractDomain } from './AbstractDomain';

export class Delivery extends AbstractDomain {

    private _id: ObjectId;
    private _orderId: ObjectId;
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

    public get orderId() {
        return this._orderId;
    }

    public set orderId(orderId:string|ObjectId) {
        if (orderId instanceof ObjectId) {
            this._orderId = orderId;
        } else if(isString(orderId)) {
            this._orderId = new ObjectId(orderId);
        }
    }

    public get status() {
        return this._status;
    }

    public set status(status: number) {
        this._status = Object.values(EPaymentStatus).filter(e => isNumber(e)).find(e => e === status) as EPaymentStatus;
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
            orderId: this.orderId,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    public static toEntity(object: object): Delivery {
        const entity = new Delivery();
        entity.id = get(object, 'id', get(object, '_id'));
        entity.orderId = get(object, 'orderId', get(object, '_orderId'));
        entity.status = get(object, 'status', get(object, '_status'));
        entity.createdAt = get(object, 'createdAt', get(object, '_createdAt'));
        entity.updatedAt = get(object, 'updatedAt', get(object, '_updatedAt'));
        return entity;
    }

}