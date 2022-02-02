import { get, omit } from "lodash";
import { IEventRepository } from "../application/IEventRepository";
import { Event } from "../domain/Event"

export class EventRepository implements IEventRepository {

    constructor(private db) {}

    async insert(event: Event):Promise<void> {
        const result = await this.db.collection('event_store').insertOne(omit(event.getData(), ['id', '_id']));
        event.id = get(result, 'insertedId');
    }

}