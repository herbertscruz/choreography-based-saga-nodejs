import { ObjectId } from "mongodb";
import { Invoice } from "../../domain/Invoice";

export interface IInvoiceRepository {
    insert(invoice: Invoice):Promise<void>;
    findByAccountFromOrderWithSuccessStatus(accountId: ObjectId, orderId: ObjectId): Promise<Invoice>;
} 