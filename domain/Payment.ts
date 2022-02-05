import { ObjectId } from 'mongodb';
import { isString, get, isNumber } from 'lodash';
import { EPaymentStatus } from './EPaymentStatus';
import { AbstractDomain } from './AbstractDomain';

export class Payment extends AbstractDomain {

    private _id: ObjectId;
    private _orderId: ObjectId;
    private _customerId: ObjectId;
    private _status: number;
    public reason: string;
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

    public set orderId(orderId:string|ObjectId) {
        if (orderId instanceof ObjectId) {
            this._orderId = orderId;
        } else if(isString(orderId)) {
            this._orderId = new ObjectId(orderId);
        }
    }

    public get customerId() {
        return this._customerId;
    }

    public set customerId(customerId:string|ObjectId) {
        if (customerId instanceof ObjectId) {
            this._customerId = customerId;
        } else if(isString(customerId)) {
            this._customerId = new ObjectId(customerId);
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

    public getData(): object {
        return {
            id: this.id,
            orderId: this.orderId,
            customerId: this.customerId,
            status: this.status,
            reason: this.reason,
            createdAt: this.createdAt
        };
    }

    public static toEntity(object: object): Payment {
        const entity = new Payment();
        entity.id = get(object, 'id', get(object, '_id'));
        entity.orderId = get(object, 'orderId', get(object, '_orderId'));
        entity.customerId = get(object, 'customerId', get(object, '_customerId'));
        entity.status = get(object, 'status', get(object, '_status'));
        entity.reason = get(object, 'reason');
        entity.createdAt = get(object, 'createdAt', get(object, '_createdAt'));
        return entity;
    }

}