process.stdin.resume();

console.log('Starting order handler...');
console.log('--------------------------------------------------');

import { rabbitmq, mongo, api }  from './config.json';
import amqplib from 'amqplib';
import { MongoClient, MongoClientOptions } from 'mongodb';
import express from 'express';
import bodyParser = require('body-parser');
import { routes } from './routes';
import { consumers } from './consumers';

let rabbitMQConnection;
let mongoDBConnection;

(async () => {
    rabbitMQConnection = await amqplib.connect(rabbitmq.url);
    const channel = await rabbitMQConnection.createChannel();
    console.log('Open connection to RabbitMQ');

    const options = { useNewUrlParser: true } as MongoClientOptions;
    mongoDBConnection = await MongoClient.connect(mongo.url, options);
    const db = mongoDBConnection.db(mongo.dbName);
    console.log('Open connection to MongoDB');

    // ---------------------------------------------------------------------------------
    // --- API
    // ---------------------------------------------------------------------------------
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    routes(app, channel, db);

    app.listen(api.port, () => console.log('Listen port %s', api.port));

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