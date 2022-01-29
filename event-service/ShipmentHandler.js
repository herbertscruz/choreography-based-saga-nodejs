const AbstractHandler = require('./AbstractHandler');
const config = require('./config.json');

module.exports = class ShipmentHandler extends AbstractHandler {
    constructor(channel) {
        super(channel, config.queues.shipment);
    }
}