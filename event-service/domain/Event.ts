import { ObjectId } from 'mongodb';
import { isString, get } from 'lodash';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

export class Event {
    private _id: ObjectId;
    private _uuid: string;
    name: string;
    service: string;
    metadata: object;
    readonly createdAt: number = Date.now();

    get id() {
        return this._id;
    }

    set id(id:string|ObjectId) {

        if (id instanceof ObjectId) {
            this._id = id;
        } else if(isString(id)) {
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

    toString() {
        return JSON.stringify({
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            service: this.service,
            metadata: this.metadata,
        });
    }

    static toEntity(object: object): Event {
        console.log(object);
        const entity = new Event();
        entity.id = get(object, 'id', get(object, '_id'));
        entity.uuid = get(object, 'uuid');
        entity.name = get(object, 'name');
        entity.service = get(object, 'service');
        entity.metadata = get(object, 'metadata');
        return entity;
    }
}