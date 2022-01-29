const HandlerFactory = require('./HandlerFactory');

module.exports = class EventService {

    constructor(channel, db) {
        this._channel = channel;
        this._db = db;
    }

    async command(message) {
        try {
            const payload = JSON.parse(message.content.toString());

            await this._db.collection('event_store').insertOne(payload);
        
            const handler = HandlerFactory.createInstance(payload.event.service, [this._channel]);
            handler.send(payload);

            this._channel.ack(message);
        } catch (err) {
            this._channel.nack(message, false, false);
        }
    }

    async replay(message) {
        try {
            const payload = JSON.parse(message.content.toString());

            await this._db.collection('event_store').insertOne(payload);

            const handler = HandlerFactory.createInstance(payload.event.service, [this._channel]);
            handler.send(payload);

            this._channel.ack(message);
        } catch (err) {
            this._channel.nack(message, false, false);
        }
    }
}