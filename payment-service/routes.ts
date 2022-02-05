import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { Express } from 'express';
import { EventHandler } from './infrastructure/EventHandler';
import { PaymentService } from './application/PaymentService';
import { ValidatorError } from '../domain/ValidatorError';
import { PaymentRepository } from './infrastructure/PaymentRepository';

export function routes(app: Express, channel: Channel, db: Db): void {

    const eventHandler = new EventHandler(channel);
    const paymentRepository = new PaymentRepository(db);
    const paymentService = new PaymentService(eventHandler, paymentRepository);

    app.post('/payments', async (req, res) => {
        try {
            console.log('Got body (/payments):', req.body);
            const payment = await paymentService.createPayment(req.body);
            res.status(200).json(payment.getData());
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