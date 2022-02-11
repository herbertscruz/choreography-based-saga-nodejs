import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { Express } from 'express';
import { EventHandler } from './infrastructure/EventHandler';
import { PaymentService } from './application/PaymentService';
import { errorHandler } from '../domain/ErrorHandler';
import { PaymentRepository } from './infrastructure/PaymentRepository';
import { PaymentResource } from './application/PaymentResource';
import { ReservationService } from './application/ReservationService';
import { OrderService } from './application/OrderService';
import { AccountService } from './application/AccountService';
import { AxiosHttpClient } from './infrastructure/AxiosHttpClient';
import { AccountRepository } from './infrastructure/AccountRepository';

export function routes(app: Express, channel: Channel, db: Db): void {

    const eventHandler = new EventHandler(channel);
    const paymentRepository = new PaymentRepository(db);
    const accountRepository = new AccountRepository(db);
    const httpClient = new AxiosHttpClient();
    const reservationService = new ReservationService(httpClient);
    const orderService = new OrderService(httpClient);
    const accountService = new AccountService(accountRepository);
    const paymentService = new PaymentService(paymentRepository, reservationService, orderService, accountService);
    const paymentResource = new PaymentResource(eventHandler, paymentService);

    app.post('/payments', async (req, res, next) => {
        try {
            console.log('Got body (/payments):', req.body);
            const payment = await paymentResource.createPayment(req.body);
            res.status(200).json(payment.getData());
        } catch (err) {
            next(err);
        }
    });

    app.use(errorHandler);

}