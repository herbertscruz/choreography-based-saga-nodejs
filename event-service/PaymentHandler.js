const AbstractHandler = require('./AbstractHandler');
const config = require('./config.json');

module.exports = class PaymentHandler extends AbstractHandler {
    constructor(channel) {
        super(channel, config.queues.payment);
    }
}