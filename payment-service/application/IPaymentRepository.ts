import { Payment } from "../../domain/Payment";

export interface IPaymentRepository {
    insert(payment: Payment):Promise<void>;
} 