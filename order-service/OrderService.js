const { v4: uuidv4 } = require('uuid');
const OrderStatus = require('./OrderStatus');
const config = require('./config.json');
const { pick, omit } = require('lodash');
const ObjectId = require('mongodb').ObjectId;

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
            metadata: { order: { ...payload } }
        };
        this._channel.sendToQueue(config.eventSourcing.queue, Buffer.from(JSON.stringify(result)));

        return payload;
    }

    async consumeStockReservation(message) {
        console.log(message);
    }

    async consumePayment(message) {
        try {
            let payload = JSON.parse(message.content.toString());
            const payment = JSON.parse(JSON.stringify(payload.metadata.payment));
            let isChanged = false;

            const order = await this._db.collection('order').findOne({ _id: ObjectId(payment.orderId) });

            payload = omit(Object.assign({}, payload, {
                metadata: { order }
            }), ['_id', 'payload.metadata.payment']);

            switch (payload.name) {
                case 'payment.success':
                    payload.metadata.order.status = OrderStatus.APPROVED;
                    payload.metadata.order.updatedAt = Date.now();
                    payload.name = 'order.approved';
                    payload.service = 'order.service';
                    isChanged = true;
                    break;
                case 'payment.failed':
                    payload.metadata.order.status = OrderStatus.REJECTED;
                    payload.metadata.order.updatedAt = Date.now();
                    payload.name = 'order.rejected';
                    payload.service = 'order.service';
                    isChanged = true;
                    break;
            }

            if (isChanged) {
                await this._db.collection('order').updateOne(
                    { _id: payload.metadata.order._id },
                    { $set: { ...omit(payload.metadata.order, ['_id', 'createdAt']) } }
                );
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