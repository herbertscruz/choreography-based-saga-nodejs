import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { OrderService } from './application/OrderService';
import { OrderRepository } from './infrastructure/OrderRepository';
import { Express } from 'express';
import { EventHandler } from './infrastructure/EventHandler';
import { ValidatorError } from '../domain/ValidatorError';

export function routes(app: Express, channel: Channel, db: Db): void {

    const eventHandler = new EventHandler(channel);
    const orderRepository = new OrderRepository(db);
    const orderService = new OrderService(eventHandler, orderRepository);

    app.post('/orders', async (req, res) => {
        try {
            console.log('Got body (/orders):', req.body);
            const order = await orderService.createPendingOrder(req.body);
            res.status(200).json(order.getData());
        } catch (err) {
            if (err instanceof ValidatorError) {
                res.status(422).json({ errors: err.errors });
            } else {
                const error = err.message || err.toString();
                res.status(500).json({ error });
            }
        }
    });

}