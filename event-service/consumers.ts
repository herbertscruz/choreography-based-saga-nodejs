import { eventSourcing } from './config.json';
import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { EventHandler } from './infrastructure/EventHandler';
import { EventRepository } from './infrastructure/EventRepository';
import { EventService } from './application/EventService';
import { EventResource } from './application/EventResource';

export function consumers(channel: Channel, db: Db): void {

    const consume = function (queue, callback) {
        channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            console.log(`Received %s`, message.content.toString());
            callback(message);
        });
    };

    const eventHandler = new EventHandler(channel);
    const eventRepository = new EventRepository(db);
    const eventService = new EventService(eventRepository);
    const eventResource = new EventResource(eventHandler, eventService);
    consume(eventSourcing.queue, message => eventResource.consumeEvent(message));
}