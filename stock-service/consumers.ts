import { ReservationService } from './application/ReservationService';
import { queues } from './config.json';
import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { ReservationRepository } from './infrastructure/ReservationRepository';
import { EventHandler } from './infrastructure/EventHandler';
import { ProductRepository } from './infrastructure/ProductRepository';
import { StockResource } from './application/StockResource';
import { ProductService } from './application/ProductService';

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
    const productService = new ProductService(productRepository);
    const reservationService = new ReservationService(reservationRepository, productRepository);
    const stockResource = new StockResource(eventHandler, reservationService, productService);
    consume(queues.order, message => stockResource.consumeOrder(message));
    consume(queues.shipment, message => stockResource.consumeShipment(message));
}