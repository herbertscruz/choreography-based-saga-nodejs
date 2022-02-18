import { ObjectId } from 'mongodb';
import { isString, get } from 'lodash';
import { AbstractDomain } from './AbstractDomain';

export class Product extends AbstractDomain {

    private _id: ObjectId;
    public name: string;
    public price: number;
    public quantity: number;
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
            name: this.name,
            price: this.price,
            quantity: this.quantity,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }

    public static toEntity(object: object): Product {
        const entity = new Product();
        entity.id = get(object, 'id', get(object, '_id'));
        entity.name = get(object, 'name');
        entity.price = get(object, 'price');
        entity.quantity = get(object, 'quantity');
        entity.createdAt = get(object, 'createdAt', get(object, '_createdAt'));
        entity.updatedAt = get(object, 'updatedAt', get(object, '_updatedAt'));
        return entity;
    }

}