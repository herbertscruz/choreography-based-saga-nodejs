import { get, omit } from "lodash";
import { IPaymentRepository } from "../application/IPaymentRepository";
import { Payment } from "../../domain/Payment";
import { ObjectId } from "mongodb";
import { EPaymentStatus } from "../../domain/EPaymentStatus";

export class PaymentRepository implements IPaymentRepository {

    constructor(private db) { }

    async insert(payment: Payment): Promise<void> {
        const result = await this.db.collection('payment').insertOne(omit(payment.getData(), ['id', '_id']));
        payment.id = get(result, 'insertedId');
    }

    async findByOrderWithSuccessStatus(orderId: ObjectId): Promise<Payment> {
        const result = await this.db.collection('payment').findOne({orderId, status: EPaymentStatus.SUCCESS});
        if (!result) return null;
        return Payment.toEntity(result);
    }

}