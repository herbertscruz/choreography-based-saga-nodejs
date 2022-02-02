import { Event } from "../domain/Event";
import { Order } from "../domain/Order";
import { IOrderRepository } from "./IOrderRepository";
import { IEventHandler } from "./IEventHandler";
import { Payment } from "../domain/Payment";
import { ObjectId } from "mongodb";
import { EOrderStatus } from "../domain/EOrderStatus";
import { get } from "lodash";

export class OrderService {
    
    constructor(private handler: IEventHandler, private repository: IOrderRepository) {}

    async createPendingOrder(payload): Promise<Order> {
        const order = Order.toEntity(payload);
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
        console.log(message);
    }

    async consumePayment(message) {
        const payload = JSON.parse(message.content.toString());
        const event = Event.toEntity(payload);

        switch (event.name) {
            case 'payment.success':
                return this.consumePaymentSuccess(message, event, EOrderStatus.APPROVED, 'order.approved');
            case 'payment.failed':
                return this.consumePaymentSuccess(message, event, EOrderStatus.REJECTED, 'order.rejected');
            default:
                this.handler.nack(message);
                break;
        }
    }

    private async consumePaymentSuccess(message, event: Event, orderStatus: EOrderStatus, nameEvent: string) {
        try {
            const payment = Payment.toEntity(get(event, 'metadata.payment', {}));

            const order = await this.repository.findById(payment.orderId as ObjectId);
            order.status = orderStatus;
            order.updatedAt = Date.now();

            await this.repository.update(order.id as ObjectId, order);

            const newEvent = {
                ...event, 
                name: nameEvent, 
                service: 'order.service',
                metadata: {order: order.getData()}
            } as Event;

            this.handler.send(newEvent);

            this.handler.ack(message);
        } catch (err) {
            this.handler.nack(message);
            throw err;
        }
    }
}