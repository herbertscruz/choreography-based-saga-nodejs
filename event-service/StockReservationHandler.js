const AbstractHandler = require('./AbstractHandler');
const config = require('./config.json');

module.exports = class StockReservationHandler extends AbstractHandler {
    constructor(channel) {
        super(channel, config.queues.stockReservation);
    }
}