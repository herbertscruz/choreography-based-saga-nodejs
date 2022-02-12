import { get } from "lodash";
import { ObjectId } from "mongodb";
import { Event } from "../../domain/Event";
import { Order } from "../../domain/Order";
import { Reservation } from "../../domain/Reservation";
import { IEventHandler } from "./IEventHandler";
import { IProductRepository } from "./IProductRepository";
import { IReservationRepository } from "./IReservationRepository";

export class ReservationService {

    constructor(
        private handler: IEventHandler,
        private reservationRepository: IReservationRepository,
        private productRepository: IProductRepository
    ) { }

    findByOrder(orderId: ObjectId): Promise<Reservation[]> {
        return this.reservationRepository.findByOrder(orderId as ObjectId);
    }

    async consumeOrder(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            let event = Event.toEntity(payload);

            event.validate({
                orderId: 'required',
                name: 'required|max:40',
                service: 'required|max:40'
            });

            switch (event.name) {
                case 'order.created':
                    event = await this.makeReservation(event);
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

    async makeReservation(event: Event): Promise<Event> {
        const order = Order.toEntity(get(event, 'metadata.order', {}));

        order.validate({
            'items.*.productId': 'required',
            quantity: 'required|integer|min:1'
        });

        const hasStock = [];
        const reservations = [];

        for (const item of order.items) {
            const product = await this.productRepository.findById(item.productId as ObjectId);
            const reservationsResult = await this.reservationRepository.findByProduct(item.productId as ObjectId);
            const totalReserved = reservationsResult.reduce((result, item) => result + item.quantity, 0);

            hasStock.push((product.quantity - totalReserved) >= 0);
            reservations.push(Reservation.toEntity({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                createdAt: Date.now()
            }));
        }

        const haveAllReservations = hasStock.every(e => e);

        if (haveAllReservations) {
            await Promise.all(reservations.map(e => this.reservationRepository.insert(e)));
        }

        return Event.toEntity({
            ...event.getData(),
            name: haveAllReservations ? 'reserved.stock' : 'product.unavailable',
            service: 'stock.reservation.service',
            metadata: { reservations: reservations.map(e => e.getData()) }
        });
    }

    async withdrawFromStock(event: Event): Promise<Event> {
        const reservations = await this.reservationRepository.findByOrder(event.orderId as ObjectId);

        return Event.toEntity({
            ...event.getData(),
            name: 'product.withdrawn',
            service: 'stock.service',
            metadata: { reservations: reservations.map(e => e.getData()) }
        });
    }

    async removeReservation(event: Event): Promise<Event> {
        await this.reservationRepository.deleteByOrder(event.orderId as ObjectId);

        return Event.toEntity({
            ...event.getData(),
            name: 'reservation.removed',
            service: 'stock.service',
            metadata: {}
        });
    }

    async consumeShipment(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            let event = Event.toEntity(payload);

            event.validate({
                orderId: 'required',
                name: 'required|max:40',
                service: 'required|max:40'
            });

            switch (event.name) {
                case 'registered.delivery':
                    event = await this.updateProductStock(event);
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

    async updateProductStock(event: Event): Promise<Event> {
        const reservations = await this.reservationRepository.findByOrder(event.orderId as ObjectId);

        for (const reservation of reservations) {
            const product = await this.productRepository.findById(reservation.productId as ObjectId);
            const quantity = product.quantity - reservation.quantity;
            product.quantity = quantity;
            await this.productRepository.update(product.id as ObjectId, product);
        }

        await this.reservationRepository.deleteByOrder(event.orderId as ObjectId);

        return Event.toEntity({
            ...event.getData(),
            name: 'updated.stock',
            service: 'stock.service',
            metadata: {}
        });
    }

}