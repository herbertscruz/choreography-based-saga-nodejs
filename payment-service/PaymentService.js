const { pick } = require('lodash');
const PaymentStatus = require('./PaymentStatus');
const config = require('./config.json');

module.exports = class PaymentService {

    constructor(channel, db) {
        this._channel = channel;
        this._db = db;
    }

    async createPayment(payload) {

        if (!payload.orderId) throw new Error('orderId is required');
        if (!payload.customerId) throw new Error('customerId is required');
        if (!payload.uuid) throw new Error('uuid is required');

        payload = pick(Object.assign({}, payload, {
            status: PaymentStatus.FAILED,
            reason: '',
            createdAt: Date.now()
        }), ['orderId', 'customerId', 'uuid', 'status', 'createdAt']);

        let eventName = 'payment.failed';

        // TODO: Check stock by orderId in payload
        const hasStock = !!Math.floor(Math.random() * 2);

        if (hasStock) {
            // TODO: Get value on purchase order by orderId in payload
            const order = {value: Math.floor(Math.random() * 10) + 1};
            // TODO: Get available limit of the customer by customerId in payload 
            const availableLimit = Math.floor(Math.random() * 10) + 1;

            if (order.value <= availableLimit) {
                eventName = 'payment.success';
                payload.status = PaymentStatus.SUCCESS
            } else {
                payload.reason = 'No limit available';
            }
        } else {
            payload.reason = 'Out of stock';
        }

        await this._db.collection('payment').insertOne(payload);

        const result = {
            uuid: payload.uuid,
            name: eventName,
            service: 'payment.service',
            metadata: {payment: {...payload}}
        };
        this._channel.sendToQueue(config.eventSourcing.queue, Buffer.from(JSON.stringify(result)));
        
        return payload;
    }
}