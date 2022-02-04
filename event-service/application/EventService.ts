import { Event } from "../../domain/Event";
import { IEventHandler } from "./IEventHandler";
import { IEventRepository } from "./IEventRepository";

export class EventService {
    
    constructor(private handler: IEventHandler, private repository: IEventRepository) {}

    async consumeEvent(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            const event = Event.toEntity(payload);
            event.createdAt = Date.now();

            await this.repository.insert(event);

            this.handler.send(event);
            this.handler.ack(message);
        } catch (err) {
            this.handler.nack(message);
            throw err;
        }
    }
}