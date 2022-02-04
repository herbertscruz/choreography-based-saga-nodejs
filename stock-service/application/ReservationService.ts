import { get } from "lodash";
import { ObjectId } from "mongodb";
import { Event } from "../../domain/Event";
import { Order } from "../../domain/Order";
import { Reservation } from "../../domain/Reservation";
import { IEventHandler } from "./IEventHandler";
import { IReservationRepository } from "./IReservationRepository";

export class ReservationService {
    
    constructor(private handler: IEventHandler, private repository: IReservationRepository) {}

    async consumeOrder(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            let event = Event.toEntity(payload);

            const order = Order.toEntity(get(event, 'metadata.order', {}));

            switch (event.name) {
                case 'order.created':
                    event = await this.makeReservation(event, order);
                    break;
                case 'order.approved':
                    event = await this.withdrawFromStock(event);
                    break;
                case 'order.rejected':
                    event = await this.removeReservation(event);
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

    async makeReservation(event: Event, order: Order): Promise<Event> {
        const reservations = [];
        for(const item of order.items) {
            reservations.push(Reservation.toEntity({
                orderId: order.id,
                productId: item.productId,
                amount: 1,
                // TODO: Check stock by productId in payload
                hasStock: !!Math.floor(Math.random() * 2),
                createdAt: Date.now()
            }));
        }

        const haveAllReservations = reservations.every(e => e.hasStock);

        if (haveAllReservations) {
            await Promise.all(reservations.map(e => this.repository.insert(e)));
        }

        return Event.toEntity({
            ...event.getData(), 
            name: haveAllReservations ? 'reserved.stock' : 'product.unavailable',
            service: 'stock.reservation.service',
            metadata: {reservations: reservations.map(e => e.getData())}
        });
    }

    async withdrawFromStock(event: Event): Promise<Event> {
        const reservations = await this.repository.findByOrder(event.orderId as ObjectId);
        // TODO: Update product stock
        await this.repository.deleteByOrder(event.orderId as ObjectId);

        return Event.toEntity({
            ...event.getData(), 
            name: 'product.withdrawn',
            service: 'stock.service',
            metadata: {reservations: reservations.map(e => e.getData())}
        });
    }

    async removeReservation(event: Event): Promise<Event> {
        await this.repository.deleteByOrder(event.orderId as ObjectId);

        return Event.toEntity({
            ...event.getData(), 
            name: 'reservation.removed',
            service: 'stock.service',
            metadata: {}
        });
    }

}