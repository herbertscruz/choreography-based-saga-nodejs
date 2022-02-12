import { EPaymentStatus } from "../../domain/EPaymentStatus";
import { Event } from "../../domain/Event";
import { Payment } from "../../domain/Payment";
import { ValidatorError } from "../../domain/ValidatorError";
import { IEventHandler } from "./IEventHandler";
import { PaymentService } from "./PaymentService";

export class PaymentResource {

    constructor(
        private handler: IEventHandler,
        private paymentService: PaymentService
    ) { }

    async createPayment(payload) {
        let payment = Payment.toEntity(payload);

        payment = await this.paymentService.create(payment);

        if (payment.status === EPaymentStatus.FAILED) {
            this.sendPaymentEvent(payment, 'payment.failed', 'payment.service');
            throw new ValidatorError({
                reason: payment.reason
            });
        }

        this.sendPaymentEvent(payment, 'payment.success', 'payment.service');

        return payment;
    }

    async consumeOrder(message) {
        console.log(message);
        // TODO: Pagamento precisa ser idemponte, tem que checar se já pagou antes
    }

    private sendPaymentEvent(payment: Payment, name: string, service: string): void {
        const event = Event.toEntity({
            orderId: payment.orderId,
            name,
            service,
            metadata: { payment: payment.getData() }
        });

        this.handler.send(event);
    }
}