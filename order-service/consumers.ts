import { OrderService } from './application/OrderService';
import { queues } from './config.json';
import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { OrderRepository } from './infrastructure/OrderRepository';
import { EventHandler } from './infrastructure/EventHandler';
import { OrderResource } from './application/OrderResource';

export function consumers(channel: Channel, db: Db): void {

    const consume = function (queue, callback) {
        channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            console.log(`Received %s`, message.content.toString());
            callback(message);
        });
    };

    const eventHandler = new EventHandler(channel);
    const orderRepository = new OrderRepository(db);
    const orderService = new OrderService(orderRepository);
    const orderResource = new OrderResource(eventHandler, orderService);
    consume(queues.stockReservation, message => orderResource.consumeStockReservation(message));
    consume(queues.payment, message => orderResource.consumePayment(message));
}