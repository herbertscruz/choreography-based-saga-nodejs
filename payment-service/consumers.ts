import { exchange, queues } from './config.json';
import { Channel } from 'amqplib';
import { get } from 'lodash';

export async function consumers(channel: Channel): Promise<void> {

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