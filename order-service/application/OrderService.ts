import { Order } from "../../common/domain/Order";
import { IOrderRepository } from "./IOrderRepository";
import { ObjectId } from "mongodb";
import { EOrderStatus } from "../../common/domain/EOrderStatus";
import { ProductService } from "./ProductService";

export class OrderService {

    constructor(
        private orderRepository: IOrderRepository,
        private productService: ProductService
    ) { }

    async createWithPendingStatus(order: Order): Promise<Order> {
        order.validate({
            'items.*.productId': 'required',
            'items.*.quantity': 'required|integer|min:1'
        });

        for (const key in order.items) {
            const product = await this.productService.findById(order.items[key].productId as ObjectId);
            if (!product) throw new Error('Product not found');
            if (product.quantity === 0 || (product.quantity - order.items[key].quantity) < 0) {
                throw new Error('Out of stock');
            }
            order.items[key].unitPrice = product.price;
        }

        order.status = EOrderStatus.PENDING;
        order.createdAt = Date.now();
        order.updatedAt = Date.now();

        await this.orderRepository.insert(order);

        return order;
    }

    public async findById(orderId: ObjectId) {
        return this.orderRepository.findById(orderId as ObjectId);
    }

    public async updateStatus(orderId: ObjectId, status: EOrderStatus): Promise<Order> {
        const order = await this.orderRepository.findById(orderId as ObjectId);
        order.status = status;
        order.updatedAt = Date.now();

        await this.orderRepository.update(orderId, order);

        return order;
    }

}