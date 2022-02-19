import { EInvoiceStatus } from "../../common/domain/EInvoiceStatus";
import { Event } from "../../common/domain/Event";
import { ValidatorError } from "../../common/domain/ValidatorError";
import { IHandler } from "../../common/application/IHandler";
import { InvoiceService } from "./InvoiceService";
import { AbstractResource } from '../../common/application/AbstractResource';

export class InvoiceResource extends AbstractResource {

    constructor(
        protected handler: IHandler,
        private invoiceService: InvoiceService
    ) {
        super(handler);
    }

    async createInvoice(payload) {
        const invoice = await this.invoiceService.makePayment(payload);

        const event = Event.toEntity({
            orderId: invoice.order.id,
        });

        if (invoice.status === EInvoiceStatus.FAILED) {
            this.sendEvent(event, 'invoice.failed', { invoice: invoice.getData() });
            throw new ValidatorError({
                reason: invoice.reason
            });
        }

        this.sendEvent(event, 'invoice.success', { invoice: invoice.getData() });

        return invoice;
    }

}