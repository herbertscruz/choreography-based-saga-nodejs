import { Channel } from 'amqplib';
import { Db, ObjectId } from 'mongodb';
import { Express } from 'express';
import { EventHandler } from './infrastructure/EventHandler';
import { errorHandler } from '../domain/ErrorHandler';
import { ReservationRepository } from './infrastructure/ReservationRepository';
import { ReservationService } from './application/ReservationService';
import { get } from 'lodash';

export function routes(app: Express, channel: Channel, db: Db): void {

    const eventHandler = new EventHandler(channel);
    const reservationRepository = new ReservationRepository(db);
    const reservationService = new ReservationService(eventHandler, reservationRepository);

    app.get('/reservations', async (req, res, next) => {
        try {
            console.log('Got body (/reservations):', req.query);
            const orderId = new ObjectId(get(req, 'query.orderId'));
            const reservations = await reservationService.findByOrder(orderId);
            res.status(200).json(reservations.map(e => e.getData()));
        } catch (err) {
            next(err);
        }
    });

    app.use(errorHandler);

}