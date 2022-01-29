const EventService = require('./EventService');
const config = require('./config.json');

module.exports = function(channel, db) {

    const consume = function (queue, callback) {
        channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            console.log(`Received %s`, message.content.toString());
            callback(message);
        });
    };

    const eventService = new EventService(channel, db);
    consume(config.eventSourcing.queue, message => eventService.consumeEvent(message));
}