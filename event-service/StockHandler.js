const AbstractHandler = require('./AbstractHandler');
const config = require('./config.json');

module.exports = class StockHandler extends AbstractHandler {
    constructor(channel) {
        super(channel, config.queues.stock);
    }
}