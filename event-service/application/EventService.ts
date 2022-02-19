import { Event } from "../../common/domain/Event";
import { IEventRepository } from "./IEventRepository";

export class EventService {

    constructor(
        private repository: IEventRepository
    ) { }

    async insert(event: Event): Promise<void> {
        event.validate({
            orderId: 'required',
            routingKey: 'required|max:40'
        });

        event.createdAt = Date.now();

        await this.repository.insert(event);
    }
}