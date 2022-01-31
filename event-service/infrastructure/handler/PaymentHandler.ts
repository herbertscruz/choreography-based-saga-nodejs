import { AbstractHandler } from "./AbstractHandler";
import { queues } from '../../config.json';
import { Channel } from 'amqplib';

export class PaymentHandler extends AbstractHandler {
    constructor(channel: Channel) {
        super(channel, queues.payment);
    }
}