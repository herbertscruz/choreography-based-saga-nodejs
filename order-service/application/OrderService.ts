import { Order } from "../../domain/Order";
import { IOrderRepository } from "./IOrderRepository";
import { ObjectId } from "mongodb";
import { EOrderStatus } from "../../domain/EOrderStatus";

export class OrderService {
    
    constructor(private repository: IOrderRepository) {}

    async createWithPendingStatus(order: Order): Promise<Order> {
        order.validate({
            'items.*.productId': 'required',
            'items.*.quantity': 'required'
        });
        // TODO: check in the product register
        order.items[0].unitPrice = 5;
        order.status = EOrderStatus.PENDING;
        order.createdAt = Date.now();
        order.updatedAt = Date.now();

        await this.repository.insert(order);

        return order;
    }

    public async findById(orderId: ObjectId) {
        return this.repository.findById(orderId as ObjectId);
    }

    public async updateStatus(orderId: ObjectId, status: EOrderStatus): Promise<Order> {
        const order = await this.repository.findById(orderId as ObjectId);
        order.status = status;
        order.updatedAt = Date.now();

        await this.repository.update(orderId, order);

        return order;
    }
}