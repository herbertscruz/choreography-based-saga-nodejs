import { IEventHandler } from "../application/IEventHandler";
import { HandlerFactory } from "./handler/HandlerFactory";
import { Channel } from 'amqplib';
import { Event } from "../domain/Event";

export class EventHandler implements IEventHandler {

    constructor(private channel: Channel) {}

    send(event: Event): void {
        const handler = HandlerFactory.createInstance(event.service, [this.channel]);
        handler.send(event);
    }

    ack(message) {
        this.channel.ack(message);
    }

    nack(message) {
        this.channel.nack(message, false, false);
    }

}