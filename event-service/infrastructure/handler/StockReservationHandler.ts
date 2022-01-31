import { AbstractHandler } from "./AbstractHandler";
import { queues } from '../../config.json';
import { Channel } from 'amqplib';

export class StockReservationHandler extends AbstractHandler {
    constructor(channel: Channel) {
        super(channel, queues.stockReservation);
    }
}