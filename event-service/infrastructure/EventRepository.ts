import { Event } from "../domain/Event"

export class EventRepository {

    constructor(private db) {}

    async insert(event: Event):Promise<void> {
        await this.db.collection('event_store').insertOne(event);
    }
}