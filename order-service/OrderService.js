const { v4: uuidv4 } = require('uuid');
const OrderStatus = require('./OrderStatus');
const config = require('./config.json');
const { pick } = require('lodash');

module.exports = class OrderService {

    constructor(channel, db) {
        this._channel = channel;
        this._db = db;
    }

    async createPendingOrder(payload) {

        payload = pick(Object.assign({}, {
            value: Math.floor(Math.random() * 10) + 1
        }, payload, {
            status: OrderStatus.PENDING
        }), ['value', 'status']);

        await this._db.collection('order').insertOne(payload);

        const result = {
            uuid: uuidv4(),
            event: {
                name: 'OrderCreated',
                service: 'order-service'
            },
            order: payload
        };
        this._channel.sendToQueue(config.eventSourcing.commandQueue, Buffer.from(JSON.stringify(result)));

        return payload;
    }

    async consumePayment(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            const isChanged = false;

            switch(payload.event.name) {
                case 'PaymentSuccess':
                    payload.order.status = OrderStatus.APPROVED;
                    payload.event.name = 'OrderApproved';
                    payload.event.service = 'order-service';
                    isChanged = true;
                    break;
                case 'PaymentFailed':       
                    payload.order.status = OrderStatus.REJECTED;
                    payload.event.name = 'OrderReject';
                    payload.event.service = 'order-service';
                    isChanged = true;
                    break;
            }

            if (eventName) {
                await this._db.Order.update(payload.order, { where: { id: payload.order.id } });
                this._channel.sendToQueue(config.eventSourcing.commandQueue, Buffer.from(JSON.stringify(payload)));

                this._channel.ack(message);
            } else {
                this._channel.nack(message, false, false);
            }
        } catch (err) {
            this._channel.nack(message, false, false);
        }
    }
}