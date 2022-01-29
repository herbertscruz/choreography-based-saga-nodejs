process.stdin.resume();

console.log('Starting stock handler...');
console.log('--------------------------------------------------');

const config = require('./config.json');
const amqplib = require('amqplib');
const MongoClient = require('mongodb').MongoClient;
const consumers = require('./consumers');

let rabbitMQConnection;
let mongoDBConnection;

(async () => {
    rabbitMQConnection = await amqplib.connect(config.rabbitmq.url);
    const channel = await rabbitMQConnection.createChannel();
    console.log('Open connection to RabbitMQ');

    mongoDBConnection = await MongoClient.connect(config.mongo.url, { useNewUrlParser: true });
    const db = mongoDBConnection.db(config.mongo.dbName);
    console.log('Open connection to MongoDB');

    // ---------------------------------------------------------------------------------
    // --- Stock handler
    // ---------------------------------------------------------------------------------
    consumers(channel, db);
})();

// ---------------------------------------------------------------------------------
// --- Closing events ---
// ---------------------------------------------------------------------------------
process.on('exit', function () {
    if (rabbitMQConnection) {
        rabbitMQConnection.close();
        console.log('Closed connection to RabbitMQ');
    }
    if (mongoDBConnection) {
        mongoDBConnection.close();
        console.log('Closed connection to MongoDB');
    }
    console.log('--------------------------------------------------');
    console.log('Stock handler stopped');
});
process.on('SIGINT', process.exit);
process.on('SIGUSR1', process.exit);
process.on('SIGUSR2', process.exit);
process.on('uncaughtException', function (err) {
    console.error(err);
    process.exit();
});