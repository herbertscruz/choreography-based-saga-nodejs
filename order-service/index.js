process.stdin.resume();

console.log('Starting order handler...');
console.log('--------------------------------------------------');

const config = require('./config.json');
const amqplib = require('amqplib');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
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
    // --- API
    // ---------------------------------------------------------------------------------
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    routes(app, channel, db);

    app.listen(config.api.port, () => console.log('Listen port %s', config.api.port));

    // ---------------------------------------------------------------------------------
    // --- Event handler
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
    console.log('Order handler stopped');
});
process.on('SIGINT', process.exit);
process.on('SIGUSR1', process.exit);
process.on('SIGUSR2', process.exit);
process.on('uncaughtException', function (err) {
    console.error(err);
    process.exit();
});