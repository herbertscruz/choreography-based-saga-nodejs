import { omit } from "lodash";
import { Event } from "../domain/Event";
import { IHandler } from "./IHandler";

export abstract class AbstractResource {

    constructor(
        protected handler: IHandler
    ) { }

    protected validateEvent(event: Event): void {
        event.validate({
            orderId: 'required',
            routingKey: 'required|max:40'
        });
    }

    protected sendEvent(event: Event, routingKey: string, metadata: object = {}): boolean {
        event = Event.toEntity({
            ...omit(event.getData(), 'createdAt'),
            routingKey,
            metadata
        });

        return this.handler.publish(event, routingKey);
    }

}