import { exchange, queues } from './config.json';
import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { Handler } from '../common/infrastructure/Handler';
import { DeliveryService } from './application/DeliveryService';
import { DeliveryRepository } from './infrastructure/DeliveryRepository';
import { ShipmentResource } from './application/ShipmentResource';
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
    const deliveryRepository = new DeliveryRepository(db);
    const deliveryService = new DeliveryService(deliveryRepository);
    const shipmentResource = new ShipmentResource(handler, deliveryService);

    await consume(queues.stock.name, message => shipmentResource.consumeStock(message));

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