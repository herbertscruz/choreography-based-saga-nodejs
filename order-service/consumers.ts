import { OrderService } from './application/OrderService';
import { queues } from './config.json';
import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { OrderRepository } from './infrastructure/OrderRepository';
import { EventHandler } from './infrastructure/EventHandler';

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
    const orderService = new OrderService(eventHandler, orderRepository);
    consume(queues.stockReservation, message => orderService.consumeStockReservation(message));
    consume(queues.payment, message => orderService.consumePayment(message));
}