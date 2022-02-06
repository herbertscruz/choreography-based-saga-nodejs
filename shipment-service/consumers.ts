import { queues } from './config.json';
import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { EventHandler } from './infrastructure/EventHandler';
import { DeliveryService } from './application/DeliveryService';
import { DeliveryRepository } from './infrastructure/DeliveryRepository';

export function consumers(channel: Channel, db: Db): void {

    const consume = function (queue, callback) {
        channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            console.log(`Received %s`, message.content.toString());
            callback(message);
        });
    };

    const eventHandler = new EventHandler(channel);
    const deliveryRepository = new DeliveryRepository(db);
    const deliveryService = new DeliveryService(eventHandler, deliveryRepository);
    consume(queues.stock, message => deliveryService.consumeStock(message));
}