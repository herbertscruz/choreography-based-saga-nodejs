import { ObjectId } from 'mongodb';
import { isString, get } from 'lodash';
import { AbstractDomain } from './AbstractDomain';

export class Account extends AbstractDomain {

    private _id: ObjectId;
    private _customerId: ObjectId;
    public balance: number;
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

    public get customerId() {
        return this._customerId;
    }

    public set customerId(customerId: string | ObjectId) {
        if (customerId instanceof ObjectId) {
            this._customerId = customerId;
        } else if (isString(customerId)) {
            this._customerId = new ObjectId(customerId);
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
            customerId: this.customerId,
            balance: this.balance,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }

    public static toEntity(object: object): Account {
        const entity = new Account();
        entity.id = get(object, 'id', get(object, '_id'));
        entity.customerId = get(object, 'customerId', get(object, '_customerId'));
        entity.balance = get(object, 'balance');
        entity.createdAt = get(object, 'createdAt', get(object, '_createdAt'));
        entity.updatedAt = get(object, 'updatedAt', get(object, '_updatedAt'));
        return entity;
    }

}