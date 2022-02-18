import { Channel } from 'amqplib';
import { Db, ObjectId } from 'mongodb';
import { Express } from 'express';
import { Handler } from '../common/infrastructure/Handler';
import { errorHandler } from '../common/domain/ErrorHandler';
import { ReservationRepository } from './infrastructure/ReservationRepository';
import { ReservationService } from './application/ReservationService';
import { get } from 'lodash';
import { ProductRepository } from './infrastructure/ProductRepository';
import { ProductService } from './application/ProductService';
import { StockResource } from './application/StockResource';
import { exchange } from './config.json';

export function routes(app: Express, channel: Channel, db: Db): void {

    const handler = new Handler(channel, exchange);
    const reservationRepository = new ReservationRepository(db);
    const productRepository = new ProductRepository(db);
    const productService = new ProductService(productRepository);
    const reservationService = new ReservationService(reservationRepository, productRepository);
    const stockResource = new StockResource(handler, reservationService, productService);

    app.get('/reservations', async (req, res, next) => {
        try {
            console.log('Got body (/reservations):', req.query);
            const orderId = new ObjectId(get(req, 'query.orderId'));
            const reservations = await stockResource.findReservationByOrder(orderId);
            res.status(200).json(reservations.map(e => e.getData()));
        } catch (err) {
            next(err);
        }
    });

    app.get('/products/:id', async (req, res, next) => {
        try {
            console.log('Got body (/products):', req.params);
            const id = new ObjectId(get(req, 'params.id'));
            const product = await stockResource.findProductById(id);
            if (!product) return res.sendStatus(204);
            res.status(200).json(product.getData());
        } catch (err) {
            next(err);
        }
    });

    app.use(errorHandler);

}