import { queues } from './config.json';
import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { EventRepository } from './infrastructure/EventRepository';
import { EventService } from './application/EventService';
import { EventResource } from './application/EventResource';

export function consumers(channel: Channel, db: Db): void {

    const consume = function (queue, callback) {
        channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            console.log(`%s - Received %s`, message.fields.routingKey, message.content.toString());
            callback(message);
        }, { noAck: true });
    };

    const eventRepository = new EventRepository(db);
    const eventService = new EventService(eventRepository);
    const eventResource = new EventResource(eventService);

    consume(queues.event.name, message => eventResource.consumeEvent(message));
}