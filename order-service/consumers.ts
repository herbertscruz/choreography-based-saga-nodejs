import { OrderService } from './application/OrderService';
import { exchange, queues } from './config.json';
import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { OrderRepository } from './infrastructure/OrderRepository';
import { OrderResource } from './application/OrderResource';
import { ProductService } from './application/ProductService';
import { AxiosHttpClient } from '../common/infrastructure/AxiosHttpClient';
import { Handler } from '../common/infrastructure/Handler';
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
    const httpClient = new AxiosHttpClient();
    const orderRepository = new OrderRepository(db);
    const productService = new ProductService(httpClient);
    const orderService = new OrderService(orderRepository, productService);
    const orderResource = new OrderResource(handler, orderService);

    await consume(queues.stock.name, message => orderResource.consumeStock(message));
    await consume(queues.invoice.name, message => orderResource.consumeInvoice(message));

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