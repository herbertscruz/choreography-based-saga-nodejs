import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { OrderService } from './application/OrderService';
import { OrderRepository } from './infrastructure/OrderRepository';
import { Express } from 'express';
import { EventHandler } from './infrastructure/EventHandler';
import { errorHandler } from '../domain/ErrorHandler';
import { OrderResource } from './application/OrderResource';

export function routes(app: Express, channel: Channel, db: Db): void {

    const eventHandler = new EventHandler(channel);
    const orderRepository = new OrderRepository(db);
    const orderService = new OrderService(orderRepository);
    const orderResource = new OrderResource(eventHandler, orderService);

    app.post('/orders', async (req, res, next) => {
        try {
            console.log('Got body (/orders):', req.body);

            const order = await orderResource.createPendingOrder(req.body);
            res.status(200).json(order.getData());
        } catch (err) {
            next(err);
        }
    });

    app.get('/orders/:id', async (req, res, next) => {
        try {
            console.log('Got body (/orders/:id):', req.params);
            const order = await orderResource.findById(req.params);
            if (!order) return res.sendStatus(204);
            res.status(200).json(order.getData());
        } catch (err) {
            next(err);
        }
    });

    app.use(errorHandler);

}