const { omit } = require('lodash');
const ShipmentStatus = require('./ShipmentStatus');
const config = require('./config.json');

module.exports = class ShipmentService {

    constructor(channel, db) {
        this._channel = channel;
        this._db = db;
    }

    async consumeStock(message) {
        try {
            let payload = JSON.parse(message.content.toString());
            let isChanged = false;

            const withdrawal = JSON.parse(JSON.stringify(payload.metadata.withdrawal || '{}'));
            payload = omit(Object.assign({}, payload, {
                createdAt: Date.now()
            }), ['_id', 'metadata.withdrawal']);

            switch(payload.name) {
                case 'product.withdrawn':
                    payload.name = 'ready.delivery';
                    payload.service = 'shipment.service';
                    isChanged = true;
                    break;
            }

            if (isChanged) {
                const result = {
                    orderId: withdrawal.orderId,
                    status: ShipmentStatus.READY,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                payload.metadata.delivery = result;

                await this._db.collection('delivery').insertOne(result);
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