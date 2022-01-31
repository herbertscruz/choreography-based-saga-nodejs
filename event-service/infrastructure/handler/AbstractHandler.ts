import { isObject } from 'lodash';
import { Channel } from 'amqplib';

export abstract class AbstractHandler {

    constructor(protected channel: Channel, private queue: string) {}

    send(message) {
        if (isObject(message)) message = JSON.stringify(message);
        this.channel.sendToQueue(this.queue, Buffer.from(message));
    }
}