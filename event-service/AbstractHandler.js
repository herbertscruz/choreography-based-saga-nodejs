const { isObject } = require('lodash');

module.exports = class AbstractHandler {

    constructor(channel, queue) {
        this._channel = channel;
        this._queue = queue;
    }

    send(message) {
        if (isObject(message)) message = JSON.stringify(message);
        this._channel.sendToQueue(this._queue, Buffer.from(message));
    }
}