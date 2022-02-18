import { Channel } from 'amqplib';
import { Db } from 'mongodb';
import { Express } from 'express';
import { EventHandler } from '../common/infrastructure/EventHandler';
import { InvoiceService } from './application/InvoiceService';
import { errorHandler } from '../common/domain/ErrorHandler';
import { InvoiceRepository } from './infrastructure/InvoiceRepository';
import { InvoiceResource } from './application/InvoiceResource';
import { ReservationService } from './application/ReservationService';
import { OrderService } from './application/OrderService';
import { AccountService } from './application/AccountService';
import { AxiosHttpClient } from '../common/infrastructure/AxiosHttpClient';
import { AccountRepository } from './infrastructure/AccountRepository';

export function routes(app: Express, channel: Channel, db: Db): void {

    const eventHandler = new EventHandler(channel);
    const invoiceRepository = new InvoiceRepository(db);
    const accountRepository = new AccountRepository(db);
    const httpClient = new AxiosHttpClient();
    const reservationService = new ReservationService(httpClient);
    const orderService = new OrderService(httpClient);
    const accountService = new AccountService(accountRepository);
    const invoiceService = new InvoiceService(invoiceRepository, reservationService, orderService, accountService);
    const invoiceResource = new InvoiceResource(eventHandler, invoiceService);

    app.post('/payments', async (req, res, next) => {
        try {
            console.log('Got body (/payments):', req.body);
            const invoice = await invoiceResource.createInvoice(req.body);
            res.status(200).json(invoice.getData());
        } catch (err) {
            next(err);
        }
    });

    app.use(errorHandler);

}