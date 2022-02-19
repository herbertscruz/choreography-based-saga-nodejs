import { ObjectId } from 'mongodb';
import { isString, get, isNumber } from 'lodash';
import { EInvoiceStatus } from './EInvoiceStatus';
import { AbstractDomain } from './AbstractDomain';
import { Order } from './Order';

export class Invoice extends AbstractDomain {

    private _id: ObjectId;
    private _accountId: ObjectId;
    private _status: number;
    public reason: string;
    public order: Order;
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

    public get accountId() {
        return this._accountId;
    }

    public set accountId(accountId: string | ObjectId) {
        if (accountId instanceof ObjectId) {
            this._accountId = accountId;
        } else if (isString(accountId)) {
            this._accountId = new ObjectId(accountId);
        }
    }

    public get status() {
        return this._status;
    }

    public set status(status: number) {
        this._status = Object.values(EInvoiceStatus).filter(e => isNumber(e)).find(e => e === status) as EInvoiceStatus;
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
            accountId: this.accountId,
            status: this.status,
            reason: this.reason,
            order: this.order.getData(),
            createdAt: this.createdAt
        };
    }

    public static toEntity(object: object): Invoice {
        const entity = new Invoice();
        entity.id = get(object, 'id', get(object, '_id'));
        entity.accountId = get(object, 'accountId', get(object, '_accountId'));
        entity.status = get(object, 'status', get(object, '_status'));
        entity.reason = get(object, 'reason');
        entity.order = Order.toEntity(get(object, 'order', {}));
        entity.createdAt = get(object, 'createdAt', get(object, '_createdAt'));
        return entity;
    }

}