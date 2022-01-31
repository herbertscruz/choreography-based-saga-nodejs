import { AbstractHandler } from "./AbstractHandler";
import { queues } from '../../config.json';
import { Channel } from 'amqplib';

export class ShipmentHandler extends AbstractHandler {
    constructor(channel: Channel) {
        super(channel, queues.shipment);
    }
}