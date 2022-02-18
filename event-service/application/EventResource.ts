import { Event } from "../../common/domain/Event";
import { EventService } from "./EventService";

export class EventResource {

    constructor(private service: EventService) {}

    async consumeEvent(message) {
        const payload = JSON.parse(message.content.toString());
        const event = Event.toEntity(payload);

        await this.service.insert(event);
    }
}