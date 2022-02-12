import { ObjectId } from "mongodb";
import { Payment } from "../../domain/Payment";

export interface IPaymentRepository {
    insert(payment: Payment):Promise<void>;
    findByOrderWithSuccessStatus(orderId: ObjectId): Promise<Payment>;
} 