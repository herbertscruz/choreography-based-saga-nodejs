import { Channel } from 'amqplib';
import { IHandler } from '../application/IHandler';
import { Event } from '../domain/Event';

export class Handler implements IHandler {

    constructor(private channel: Channel, private exchange: string) {}

    publish(event: Event, routingKey: string): boolean {
        return this.channel.publish(this.exchange, routingKey, Buffer.from(event.toString()));
    }

}