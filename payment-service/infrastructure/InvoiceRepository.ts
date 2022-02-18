import { get, omit } from "lodash";
import { IInvoiceRepository } from "../application/IInvoiceRepository";
import { Invoice } from "../../common/domain/Invoice";
import { ObjectId } from "mongodb";
import { EInvoiceStatus } from "../../common/domain/EInvoiceStatus";

export class InvoiceRepository implements IInvoiceRepository {

    constructor(private db) { }

    async insert(invoice: Invoice): Promise<void> {
        const result = await this.db.collection('invoice').insertOne(omit(invoice.getData(), ['id', '_id']));
        invoice.id = get(result, 'insertedId');
    }

    async findByAccountFromOrderWithSuccessStatus(accountId: ObjectId, orderId: ObjectId): Promise<Invoice> {
        const result = await this.db.collection('invoice').findOne({
            accountId, status: EInvoiceStatus.SUCCESS,
            'order.id': orderId
        });
        if (!result) return null;
        return Invoice.toEntity(result);
    }

}