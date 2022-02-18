import { get, isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { EInvoiceStatus } from "../../common/domain/EInvoiceStatus";
import { Invoice } from "../../common/domain/Invoice";
import { ValidatorError } from "../../common/domain/ValidatorError";
import { AccountService } from "./AccountService";
import { IInvoiceRepository } from "./IInvoiceRepository";
import { OrderService } from "./OrderService";
import { ReservationService } from "./ReservationService";
import Validator from 'validatorjs';

export class InvoiceService {

    constructor(
        private invoiceRepository: IInvoiceRepository,
        private reservationService: ReservationService,
        private orderService: OrderService,
        private accountService: AccountService
    ) { }

    public async makePayment(payload: object): Promise<Invoice> {
        const validation = new Validator(
            payload,
            {
                orderId: 'required',
                customerId: 'required'
            }
        );

        if (validation.fails()) {
            throw new ValidatorError(validation.errors);
        }

        const orderId = new ObjectId(get(payload, 'orderId'));
        const customerId = new ObjectId(get(payload, 'customerId'));

        const account = await this.accountService.findByCustomer(customerId);

        const invoiceResult = await this.invoiceRepository.findByAccountFromOrderWithSuccessStatus(account.id as ObjectId, orderId);
        if (invoiceResult) throw new ValidatorError({message: 'The order cannot be paid for more than once'});
        
        const reservations = await this.reservationService.findByOrder(orderId as ObjectId);
        const order = await this.orderService.findById(orderId as ObjectId);

        let status;
        let reason;

        if (isEmpty(reservations)) {
            status = EInvoiceStatus.FAILED;
            reason = 'Out of stock';
        } else {
            const totalOrder = order.items.reduce((result, item) => result + Number((item.unitPrice * item.quantity).toFixed(4)), 0.0);
    
            if (totalOrder <= account.balance) {
                status = EInvoiceStatus.SUCCESS;
                account.balance = Number((account.balance - totalOrder).toFixed(4));
                await this.accountService.update(account.id as ObjectId, account);
            } else {
                status = EInvoiceStatus.FAILED;
                reason = 'No limit available';
            }
        }

        const invoice = Invoice.toEntity({
            accountId: account.id,
            status,
            reason,
            order,
            createdAt: Date.now()
        });

        await this.invoiceRepository.insert(invoice);

        return invoice;
    }
}