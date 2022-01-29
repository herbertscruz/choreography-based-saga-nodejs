const ShipmentService = require('./ShipmentService');
const config = require('./config.json');

module.exports = function(channel, db) {

    const consume = function (queue, callback) {
        channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            console.log(`Received %s`, message.content.toString());
            callback(message);
        });
    };

    const shipmentService = new ShipmentService(channel, db);
    consume(config.queues.stock, message => shipmentService.consumeStock(message));
}