import { ReservationService } from './application/ReservationService';
import { queues } from './config.json';
import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { ReservationRepository } from './infrastructure/ReservationRepository';
import { EventHandler } from './infrastructure/EventHandler';
import { ProductRepository } from './infrastructure/ProductRepository';

export function consumers(channel: Channel, db: Db): void {

    const consume = function (queue, callback) {
        channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            console.log(`Received %s`, message.content.toString());
            callback(message);
        });
    };

    const eventHandler = new EventHandler(channel);
    const reservationRepository = new ReservationRepository(db);
    const productRepository = new ProductRepository(db);
    const reservationService = new ReservationService(eventHandler, reservationRepository, productRepository);
    consume(queues.order, message => reservationService.consumeOrder(message));
    consume(queues.shipment, message => reservationService.consumeShipment(message));
}