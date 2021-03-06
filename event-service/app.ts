process.stdin.resume();

console.log('Starting event handler...');
console.log('--------------------------------------------------');

import { rabbitmq, mongo } from './config.json';
import amqplib from 'amqplib';
import { MongoClient, MongoClientOptions } from 'mongodb';
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
    console.log('Event handler stopped');
});
process.on('SIGINT', process.exit);
process.on('SIGUSR1', process.exit);
process.on('SIGUSR2', process.exit);
process.on('uncaughtException', function (err) {
    console.error(err);
    process.exit();
});