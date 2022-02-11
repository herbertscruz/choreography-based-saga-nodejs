import { ObjectId } from "mongodb";
import { EOrderStatus } from "../../domain/EOrderStatus";
import { Event } from "../../domain/Event";
import { Order } from "../../domain/Order";
import { IEventHandler } from "./IEventHandler";
import { OrderService } from "./OrderService";

export class OrderResource {
    
    constructor(private handler: IEventHandler, private service: OrderService) {}

    public async createPendingOrder(payload): Promise<Order> {
        let order = Order.toEntity(payload);

        order = await this.service.createWithPendingStatus(order);

        this.sendOrderEvent(order, 'order.created', 'order.service');

        return order;
    }

    public findById(params): Promise<Order> {
        const id = new ObjectId(params.id);
        return this.service.findById(id);
    }

    public async consumeStockReservation(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            const event = Event.toEntity(payload);

            this.validateEvent(event);

            let order;

            switch (event.name) {
                case 'product.unavailable':
                    order = await this.service.updateStatus(event.orderId as ObjectId, EOrderStatus.REJECTED);
                    this.sendOrderEvent(order, 'order.rejected', 'order.service');
                    this.handler.ack(message);
                    break;
                default:
                    this.handler.nack(message);
                    break;
            }
        } catch (err) {
            this.handler.nack(message);
            throw err;
        }
    }

    public async consumePayment(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            const event = Event.toEntity(payload);

            this.validateEvent(event);

            let order;

            switch (event.name) {
                case 'payment.success':
                    order = await this.service.updateStatus(event.orderId as ObjectId, EOrderStatus.APPROVED);
                    this.sendOrderEvent(order, 'order.approved', 'order.service');
                    this.handler.ack(message);
                    break;
                case 'payment.failed':
                    order = await this.service.updateStatus(event.orderId as ObjectId, EOrderStatus.REJECTED);
                    this.sendOrderEvent(order, 'order.rejected', 'order.service');
                    this.handler.ack(message);
                    break;
                default:
                    this.handler.nack(message);
                    break;
            }
        } catch (err) {
            this.handler.nack(message);
            throw err;
        }
    }

    private validateEvent(event: Event): void {
        event.validate({
            orderId: 'required',
            name: 'required|max:40',
            service: 'required|max:40'
        });
    }

    private sendOrderEvent(order: Order, name: string, service: string): void {
        const event = Event.toEntity({
            orderId: order.id,
            name,
            service,
            metadata: {order: order.getData()}
        });

        this.handler.send(event);
    }
}