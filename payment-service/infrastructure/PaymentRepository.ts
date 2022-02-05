import { get, omit } from "lodash";
import { IPaymentRepository } from "../application/IPaymentRepository";
import { Payment } from "../../domain/Payment";

export class PaymentRepository implements IPaymentRepository {

    constructor(private db) { }

    async insert(payment: Payment): Promise<void> {
        const result = await this.db.collection('payment').insertOne(omit(payment.getData(), ['id', '_id']));
        payment.id = get(result, 'insertedId');
    }

}