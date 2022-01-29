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
            items: [{
                productId: ''
            }]
        }, payload, {
            status: OrderStatus.PENDING,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }), ['items', 'status', 'createdAt', 'updatedAt']);

        await this._db.collection('order').insertOne(payload);

        const result = {
            uuid: uuidv4(),
            name: 'order.created',
            service: 'order.service',
            metadata: {order: {...payload}}
        };
        this._channel.sendToQueue(config.eventSourcing.queue, Buffer.from(JSON.stringify(result)));

        return payload;
    }

    async consumeStock(message) {
        console.log(message.content.toString());
        //TODO: Cancel the order if any product is unavailable
    }

    async consumePayment(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            const isChanged = false;

            switch(payload.name) {
                case 'payment.success':
                    payload.metadata.order.status = OrderStatus.APPROVED;
                    payload.name = 'order.approved';
                    payload.service = 'order.service';
                    isChanged = true;
                    break;
                case 'payment.failed':       
                    payload.metadata.order.status = OrderStatus.REJECTED;
                    payload.name = 'order.rejected';
                    payload.service = 'order.service';
                    isChanged = true;
                    break;
            }

            if (eventName) {
                await this._db.collection('order').update(payload.metadata.order, { where: { id: payload.metadata.order.id } });
                this._channel.sendToQueue(config.eventSourcing.queue, Buffer.from(JSON.stringify(payload)));

                this._channel.ack(message);
            } else {
                this._channel.nack(message, false, false);
            }
        } catch (err) {
            this._channel.nack(message, false, false);
            throw err;
        }
    }
}