import { Order } from "../domain/Order"

export class OrderRepository {

    constructor(private db) {}

    async insert(order: Order):Promise<void> {
        await this.db.collection('order').insertOne(order);
    }
}