import { omit } from "lodash";
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

        const event = Event.toEntity({
            orderId: order.id,
        });

        this.sendEvent(event, 'order.created', 'order.service', {order: order.getData()});

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
                    this.sendEvent(event, 'order.rejected', 'order.service', {order: order.getData()});
                    break;
                default:
                    this.handler.nack(message);
                    return;
            }

            this.handler.ack(message);
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
                case 'invoice.success':
                    order = await this.service.updateStatus(event.orderId as ObjectId, EOrderStatus.APPROVED);
                    this.sendEvent(event, 'order.approved', 'order.service', {order: order.getData()});
                    break;
                case 'invoice.failed':
                    order = await this.service.updateStatus(event.orderId as ObjectId, EOrderStatus.REJECTED);
                    this.sendEvent(event, 'order.rejected', 'order.service', {order: order.getData()});
                    break;
                default:
                    this.handler.nack(message);
                    return;
            }

            this.handler.ack(message);
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

    private sendEvent(event: Event, name: string, service: string, metadata: object = {}): void {
        event = Event.toEntity({
            ...omit(event.getData(), 'createdAt'), 
            name, service, metadata
        });

        this.handler.send(event);
    }
}