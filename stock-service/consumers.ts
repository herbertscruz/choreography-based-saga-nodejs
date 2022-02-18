import { ReservationService } from './application/ReservationService';
import { exchange, queues } from './config.json';
import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { ReservationRepository } from './infrastructure/ReservationRepository';
import { Handler } from '../common/infrastructure/Handler';
import { ProductRepository } from './infrastructure/ProductRepository';
import { StockResource } from './application/StockResource';
import { ProductService } from './application/ProductService';
import { get } from 'lodash';

export async function consumers(channel: Channel, db: Db): Promise<void> {

    const consume = async function (queue, callback) {
        await channel.assertQueue(queue, { durable: false });
        await channel.consume(queue, message => {
            console.log(`%s - Received %s`, message.fields.routingKey, message.content.toString());
            callback(message);
        }, { noAck: true });
    };

    const handler = new Handler(channel, exchange);
    const reservationRepository = new ReservationRepository(db);
    const productRepository = new ProductRepository(db);
    const productService = new ProductService(productRepository);
    const reservationService = new ReservationService(reservationRepository, productRepository);
    const stockResource = new StockResource(handler, reservationService, productService);

    await consume(queues.order.name, message => stockResource.consumeOrder(message));
    await consume(queues.shipment.name, message => stockResource.consumeShipment(message));

    await channel.assertExchange(exchange, 'topic', { durable: false });

    Object.values(queues).forEach(async queue => {
        if (get(queue, 'type') === 'exchange') {
            await channel.assertExchange(get(queue, 'name'), 'topic', { durable: false });
            get(queue, 'routingKey', []).forEach(key => channel.bindExchange(get(queue, 'name'), exchange, key));
        } else {
            get(queue, 'routingKey', []).forEach(key => channel.bindQueue(get(queue, 'name'), exchange, key));
        }
    });
}