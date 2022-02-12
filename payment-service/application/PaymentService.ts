import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { EPaymentStatus } from "../../domain/EPaymentStatus";
import { Payment } from "../../domain/Payment";
import { ValidatorError } from "../../domain/ValidatorError";
import { AccountService } from "./AccountService";
import { IPaymentRepository } from "./IPaymentRepository";
import { OrderService } from "./OrderService";
import { ReservationService } from "./ReservationService";

export class PaymentService {

    constructor(
        private paymentRepository: IPaymentRepository,
        private reservationService: ReservationService,
        private orderService: OrderService,
        private accountService: AccountService
    ) { }

    public async create(payment: Payment): Promise<Payment> {
        payment.validate({
            orderId: 'required',
            customerId: 'required'
        });
        payment.createdAt = Date.now();

        const paymentResult = await this.paymentRepository.findByOrderWithSuccessStatus(payment.orderId as ObjectId);
        if (paymentResult) throw new ValidatorError({message: 'The order cannot be paid for more than once'});

        const reservations = await this.reservationService.findByOrder(payment.orderId as ObjectId);

        if (isEmpty(reservations)) {
            payment.status = EPaymentStatus.FAILED;
            payment.reason = 'Out of stock';
        } else {
            const order = await this.orderService.findById(payment.orderId as ObjectId);
            const totalOrder = order.items.reduce((result, item) => result + (item.unitPrice * item.quantity), 0.0);
            const account = await this.accountService.findByCustomer(payment.customerId as ObjectId);
    
            if (totalOrder <= account.balance) {
                payment.status = EPaymentStatus.SUCCESS;
                account.balance = account.balance - totalOrder;
                await this.accountService.update(account.id as ObjectId, account);
            } else {
                payment.status = EPaymentStatus.FAILED;
                payment.reason = 'No limit available';
            }
        }

        await this.paymentRepository.insert(payment);

        return payment;
    }
}