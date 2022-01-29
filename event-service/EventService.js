const HandlerFactory = require('./HandlerFactory');
const { pick } = require('lodash');

module.exports = class EventService {

    constructor(channel, db) {
        this._channel = channel;
        this._db = db;
    }

    async consumeEvent(message) {
        try {
            let payload = JSON.parse(message.content.toString());

            payload = pick(Object.assign({}, payload, {
                createdAt: Date.now()
            }), ['_id', 'uuid', 'name', 'service', 'metadata', 'createdAt']);

            await this._db.collection('event_store').insertOne(payload);
        
            const handler = HandlerFactory.createInstance(payload.service, [this._channel]);
            handler.send(payload);

            this._channel.ack(message);
        } catch (err) {
            console.log(err);
            this._channel.nack(message, false, false);
        }
    }
}