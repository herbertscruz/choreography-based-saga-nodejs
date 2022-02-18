import { omit } from "lodash";
import { ObjectId } from "mongodb";
import { EOrderStatus } from "../../common/domain/EOrderStatus";
import { Event } from "../../common/domain/Event";
import { Order } from "../../common/domain/Order";
import { OrderService } from "./OrderService";
import { IHandler } from "../../common/application/IHandler";

export class OrderResource {
    
    constructor(private handler: IHandler, private orderService: OrderService) {}

    public async createPendingOrder(payload): Promise<Order> {
        let order = Order.toEntity(payload);

        order = await this.orderService.createWithPendingStatus(order);

        const event = Event.toEntity({
            orderId: order.id,
        });

        this.sendEvent(event, 'order.created', {order: order.getData()});

        return order;
    }

    public findById(params): Promise<Order> {
        const id = new ObjectId(params.id);
        return this.orderService.findById(id);
    }

    public async consumeStock(message) {
        const payload = JSON.parse(message.content.toString());
        const event = Event.toEntity(payload);

        this.validateEvent(event);

        let order;

        switch (event.name) {
            case 'unreserved.stock':
                order = await this.orderService.updateStatus(event.orderId as ObjectId, EOrderStatus.REJECTED);
                this.sendEvent(event, 'order.rejected', {order: order.getData()});
                break;
        }
    }

    public async consumeInvoice(message) {
        const payload = JSON.parse(message.content.toString());
        const event = Event.toEntity(payload);

        this.validateEvent(event);

        let order;

        switch (event.name) {
            case 'invoice.success':
                order = await this.orderService.updateStatus(event.orderId as ObjectId, EOrderStatus.APPROVED);
                this.sendEvent(event, 'order.approved', {order: order.getData()});
                break;
            case 'invoice.failed':
                order = await this.orderService.updateStatus(event.orderId as ObjectId, EOrderStatus.REJECTED);
                this.sendEvent(event, 'order.rejected', {order: order.getData()});
                break;
        }
    }

    private validateEvent(event: Event): void {
        event.validate({
            orderId: 'required',
            name: 'required|max:40',
            service: 'required|max:40'
        });
    }

    private sendEvent(event: Event, routingKey: string, metadata: object = {}): void {
        event = Event.toEntity({
            ...omit(event.getData(), 'createdAt'), 
            name: routingKey, service: 'order.service', metadata
        });

        this.handler.publish(event, routingKey);
    }
}