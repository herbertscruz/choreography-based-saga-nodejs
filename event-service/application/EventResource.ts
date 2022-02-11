import { Event } from "../../domain/Event";
import { EventService } from "./EventService";
import { IEventHandler } from "./IEventHandler";

export class EventResource {

    constructor(private handler: IEventHandler, private service: EventService) {}

    async consumeEvent(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            const event = Event.toEntity(payload);

            await this.service.insert(event);

            this.handler.send(event);
            this.handler.ack(message);
        } catch (err) {
            this.handler.nack(message);
            throw err;
        }
    }
}