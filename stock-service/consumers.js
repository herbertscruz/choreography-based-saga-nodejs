const StockService = require('./StockService');
const config = require('./config.json');

module.exports = function(channel, db) {

    const consume = function (queue, callback) {
        channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            console.log(`Received %s`, message.content.toString());
            callback(message);
        });
    };

    const stockService = new StockService(channel, db);
    consume(config.queues.order, message => stockService.consumeOrder(message));
}