const PaymentService = require('./PaymentService');
const config = require('./config.json');

module.exports = function(channel, db) {

    const consume = function (queue, callback) {
        channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            console.log(`Received %s`, message.content.toString());
            callback(message);
        });
    };

    const paymentService = new PaymentService(channel, db);
}