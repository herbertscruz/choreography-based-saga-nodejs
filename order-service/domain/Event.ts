import { ObjectId } from 'mongodb';
import { isString, get } from 'lodash';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

export class Event {
    private _id: ObjectId;
    private _uuid: string;
    name: string;
    service: string;
    metadata: object;
    private _createdAt: number;

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

    get uuid() {
        return this._uuid;
    }

    set uuid(uuid: string) {
        if (uuidValidate(uuid) && uuidVersion(uuid) === 4) {
            this._uuid = uuid;
        }
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

    toString() {
        return JSON.stringify({
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            service: this.service,
            metadata: this.metadata,
            createdAt: this.createdAt
        });
    }

    static toEntity(object: object): Event {
        const entity = new Event();
        entity.id = get(object, 'id', get(object, '_id'));
        entity.uuid = get(object, 'uuid');
        entity.name = get(object, 'name');
        entity.service = get(object, 'service');
        entity.metadata = get(object, 'metadata');
        entity.createdAt = get(object, 'createdAt');
        return entity;
    }
}