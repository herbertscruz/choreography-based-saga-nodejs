import { Payment } from "../../domain/Payment";
import { IEventHandler } from "./IEventHandler";
import { EPaymentStatus } from "../../domain/EPaymentStatus";
import { IPaymentRepository } from "./IPaymentRepository";
import { Event } from "../../domain/Event";

export class PaymentService {
    
    constructor(private handler: IEventHandler, private repository: IPaymentRepository) {}

    async createPayment(payload) {
        const payment = Payment.toEntity({
            ...payload,
            status: EPaymentStatus.FAILED,
            reason: '',
            createdAt: Date.now()
        });

        payment.validate({
            orderId: 'required',
            customerId: 'required'
        });

        let eventName = 'payment.failed';

        // TODO: Check stock by orderId in payload
        const hasStock = !!Math.floor(Math.random() * 2);

        if (hasStock) {
            // TODO: Get order items
            // TODO: Get the total of the order items 
            const total = Math.floor(Math.random() * 10) + 1;
            // TODO: Get available balance of the customer by customerId in payload 
            const account = {balance: Math.floor(Math.random() * 10) + 1};

            if (total <= account.balance) {
                eventName = 'payment.success';
                payment.status = EPaymentStatus.SUCCESS
            } else {
                payment.reason = 'No limit available';
            }
        } else {
            payment.reason = 'Out of stock';
        }

        await this.repository.insert(payment);

        if (eventName == 'payment.success') {
            //TODO: Debit from balance
        }

        const event = Event.toEntity({
            orderId: payment.orderId,
            name: eventName,
            service: 'payment.service',
            metadata: {payment: {...payment.getData()}}
        });

        this.handler.send(event);

        return payment;
    }

    async consumeOrder(message) {
        console.log(message);
    }
}