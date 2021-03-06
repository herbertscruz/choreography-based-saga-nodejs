import { get, omit } from "lodash";
import { Db, ObjectId } from "mongodb";
import { IOrderRepository } from "../application/IOrderRepository";
import { Order } from "../../common/domain/Order"

export class OrderRepository implements IOrderRepository {

    constructor(
        private db: Db
    ) { }

    async insert(order: Order): Promise<void> {
        const result = await this.db.collection('order').insertOne(omit(order.getData(), ['id', '_id']));
        order.id = get(result, 'insertedId');
    }

    async findById(id: ObjectId): Promise<Order> {
        const result = await this.db.collection('order').findOne({ _id: id });
        if (!result) return null;
        return Order.toEntity(result);
    }

    async update(id: ObjectId, order: Order): Promise<void> {
        const data = order.getData();
        await this.db.collection('order').updateOne(
            { _id: id },
            { $set: omit(data, ['id', '_id']) }
        );
    }

}