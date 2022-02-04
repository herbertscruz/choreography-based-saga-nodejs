import { Channel } from 'amqplib';
import { IEventHandler } from '../application/IEventHandler';
import { eventSourcing } from '../config.json';
import { Event } from '../../domain/Event';

export class EventHandler implements IEventHandler {

    constructor(private channel: Channel) {}

    send(event: Event): void {
        this.channel.sendToQueue(eventSourcing.queue, Buffer.from(event.toString()));
    }

    ack(message) {
        this.channel.ack(message);
    }

    nack(message) {
        this.channel.nack(message, false, false);
    }

}