import { Event } from "../domain/Event";
import { Order } from "../domain/Order";
import { IOrderRepository } from "./IOrderRepository";
import { v4 as uuidv4 } from 'uuid';
import { IEventHandler } from "./IEventHandler";

export class OrderService {
    
    constructor(private handler: IEventHandler, private repository: IOrderRepository) {}

    async createPendingOrder(payload): Promise<Order> {
        const order = Order.toEntity(payload);

        await this.repository.insert(order);

        const event = Event.toEntity({
            uuid: uuidv4(),
            name: 'order.created',
            service: 'order.service',
            metadata: { order }
        });

        this.handler.send(event);

        return order;
    }

    async consumeStockReservation(message) {
        console.log(message);
    }

    async consumePayment(message) {
        console.log(message);
    }
}