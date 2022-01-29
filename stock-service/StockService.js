const { omit } = require('lodash');
const config = require('./config.json');

module.exports = class StockService {

    constructor(channel, db) {
        this._channel = channel;
        this._db = db;
    }

    async consumeOrder(message) {
        try {
            let payload = JSON.parse(message.content.toString());
            let isChanged = false;

            const order = JSON.parse(JSON.stringify(payload.metadata.order));
            payload = omit(Object.assign({}, payload, {
                metadata: {
                    reservations: [] 
                }
            }), ['metadata.order']);

            const reservation = {
                orderId: order._id,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            switch(payload.name) {
                case 'order.created':
                    for(const item of order.items) {
                        // TODO: Check stock by productId in payload
                        const hasStock = !!Math.floor(Math.random() * 2);

                        const currentReservation = Object.assign({}, JSON.parse(JSON.stringify(reservation)), {
                            hasStock,
                            productId: item.productId
                        });
                        payload.metadata.reservations.push(currentReservation);
                    }
                    const haveAllReservations = payload.metadata.reservations.every(e => e.hasStock);
                    payload.name = haveAllReservations ? 'reserved.stock' : 'product.unavailable';
                    payload.service = 'stock.service';
                    isChanged = true;
                    break;
            }

            if (isChanged) {
                if (payload.name === 'reserved.stock') {
                    const items = [];
                    for(const currentReservation of payload.metadata.reservations) {
                        items.push(this._db.collection('reservation').insertOne(omit(currentReservation, 'hasStock')));
                    }
                    await Promise.all(items);
                }

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