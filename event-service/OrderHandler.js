const AbstractHandler = require('./AbstractHandler');
const config = require('./config.json');

module.exports = class OrderHandler extends AbstractHandler {
    constructor(channel) {
        super(channel, config.queues.order);
    }
}