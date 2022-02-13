import { EInvoiceStatus } from "../../domain/EInvoiceStatus";
import { Event } from "../../domain/Event";
import { Invoice } from "../../domain/Invoice";
import { ValidatorError } from "../../domain/ValidatorError";
import { IEventHandler } from "./IEventHandler";
import { InvoiceService } from "./InvoiceService";

export class InvoiceResource {

    constructor(
        private handler: IEventHandler,
        private invoiceService: InvoiceService
    ) { }

    async createInvoice(payload) {
        const invoice = await this.invoiceService.makePayment(payload);

        if (invoice.status === EInvoiceStatus.FAILED) {
            this.sendInvoiceEvent(invoice, 'invoice.failed', 'invoice.service');
            throw new ValidatorError({
                reason: invoice.reason
            });
        }

        this.sendInvoiceEvent(invoice, 'invoice.success', 'invoice.service');

        return invoice;
    }

    async consumeOrder(message) {
        console.log(message);
        // TODO: Pagamento precisa ser idemponte, tem que checar se já pagou antes
    }

    private sendInvoiceEvent(invoice: Invoice, name: string, service: string): void {
        const event = Event.toEntity({
            orderId: invoice.order.id,
            name,
            service,
            metadata: { invoice: invoice.getData() }
        });

        this.handler.send(event);
    }
}