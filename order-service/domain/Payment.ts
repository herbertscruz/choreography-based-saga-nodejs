import { ObjectId } from 'mongodb';
import { isString, get, isNumber } from 'lodash';
import { EPaymentStatus } from './EPaymentStatus';
import { IDomain } from './IDomain';

export class Payment implements IDomain {

    private _orderId: ObjectId;
    private _customerId: ObjectId;
    private _status: number;
    public reason: string;
    private _createdAt: number;

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

    public toString(): string {
        return JSON.stringify(this.getData());
    }

    public getData(): object {
        return {
            orderId: this.orderId,
            customerId: this.customerId,
            status: this.status,
            reason: this.reason,
            createdAt: this.createdAt
        };
    }

    static toEntity(object: object): Payment {
        const entity = new Payment();
        entity.orderId = get(object, 'orderId');
        entity.customerId = get(object, 'customerId');
        entity.status = get(object, 'status');
        entity.reason = get(object, 'reason');
        entity.createdAt = get(object, 'createdAt');
        return entity;
    }
}