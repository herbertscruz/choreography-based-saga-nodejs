import { AbstractHandler } from "./AbstractHandler";
import { queues } from '../../config.json';
import { Channel } from 'amqplib';

export class OrderHandler extends AbstractHandler {
    constructor(channel: Channel) {
        super(channel, queues.order);
    }
}