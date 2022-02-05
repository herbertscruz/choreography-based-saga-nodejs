import { Event } from "../../domain/Event";
import { Order } from "../../domain/Order";
import { IOrderRepository } from "./IOrderRepository";
import { IEventHandler } from "./IEventHandler";
import { ObjectId } from "mongodb";
import { EOrderStatus } from "../../domain/EOrderStatus";

export class OrderService {
    
    constructor(private handler: IEventHandler, private repository: IOrderRepository) {}

    async createPendingOrder(payload): Promise<Order> {
        const order = Order.toEntity(payload);

        order.validate({
            'items.*.productId': 'required'
        });

        order.status = EOrderStatus.PENDING;
        order.createdAt = Date.now();
        order.updatedAt = Date.now();

        await this.repository.insert(order);

        const event = Event.toEntity({
            orderId: order.id,
            name: 'order.created',
            service: 'order.service',
            metadata: {order: order.getData()}
        });

        this.handler.send(event);

        return order;
    }

    async consumeStockReservation(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            let event = Event.toEntity(payload);

            event.validate({
                orderId: 'required',
                name: 'required|max:40',
                service: 'required|max:40'
            });

            switch (event.name) {
                case 'product.unavailable':
                    event = await this.rejectOrder(event);
                    break;
                default:
                    this.handler.nack(message);
                    return;
            }

            this.handler.send(event);

            this.handler.ack(message);
        } catch (err) {
            this.handler.nack(message);
            throw err;
        }
    }

    async consumePayment(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            let event = Event.toEntity(payload);

            event.validate({
                orderId: 'required',
                name: 'required|max:40',
                service: 'required|max:40'
            });

            switch (event.name) {
                case 'payment.success':
                    event = await this.approveOrder(event);
                    break;
                case 'payment.failed':
                    event = await this.rejectOrder(event);
                    break;
                default:
                    this.handler.nack(message);
                    return;
            }

            this.handler.send(event);

            this.handler.ack(message);
        } catch (err) {
            this.handler.nack(message);
            throw err;
        }
    }

    private async approveOrder(event: Event): Promise<Event> {
        const order = await this.repository.findById(event.orderId as ObjectId);
        order.status = EOrderStatus.APPROVED;
        order.updatedAt = Date.now();

        await this.repository.update(order.id as ObjectId, order);

        return Event.toEntity({
            ...event.getData(), 
            name: 'order.approved',
            service: 'order.service',
            metadata: {order: order.getData()}
        });
    }

    private async rejectOrder(event: Event): Promise<Event> {
        const order = await this.repository.findById(event.orderId as ObjectId);
        order.status = EOrderStatus.REJECTED;
        order.updatedAt = Date.now();

        await this.repository.update(order.id as ObjectId, order);

        return Event.toEntity({
            ...event.getData(), 
            name: 'order.rejected',
            service: 'order.service',
            metadata: {order: order.getData()}
        });
    }
}