import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { OrderService } from './application/OrderService';
import { OrderRepository } from './infrastructure/OrderRepository';
import { Express } from 'express';
import { errorHandler } from '../common/domain/ErrorHandler';
import { OrderResource } from './application/OrderResource';
import { AxiosHttpClient } from '../common/infrastructure/AxiosHttpClient';
import { ProductService } from './application/ProductService';
import { exchange } from './config.json';
import { Handler } from '../common/infrastructure/Handler';

export function routes(app: Express, channel: Channel, db: Db): void {

    const handler = new Handler(channel, exchange);
    const httpClient = new AxiosHttpClient();
    const orderRepository = new OrderRepository(db);
    const productService = new ProductService(httpClient);
    const orderService = new OrderService(orderRepository, productService);
    const orderResource = new OrderResource(handler, orderService);

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