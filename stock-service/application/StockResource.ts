import { get, isEmpty, omit } from "lodash";
import { ObjectId } from "mongodb";
import { Event } from "../../domain/Event";
import { Order } from "../../domain/Order";
import { Product } from "../../domain/Product";
import { Reservation } from "../../domain/Reservation";
import { IEventHandler } from "./IEventHandler";
import { ProductService } from "./ProductService";
import { ReservationService } from "./ReservationService";

export class StockResource {

    constructor(
        private handler: IEventHandler, 
        private reservationService: ReservationService, 
        private productService: ProductService
    ) {}

    findReservationByOrder(orderId: ObjectId): Promise<Reservation[]> {
        return this.reservationService.findByOrder(orderId as ObjectId);
    }

    findProductById(id: ObjectId): Promise<Product> {
        return this.productService.findById(id as ObjectId);
    }

    async consumeOrder(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            const event = Event.toEntity(payload);

            this.validateEvent(event);

            let order;
            let reservations;
            let name;

            switch (event.name) {
                case 'order.created':
                    order = Order.toEntity(get(event, 'metadata.order', {}));
                    reservations = await this.reservationService.makeReservation(order);
                    name = isEmpty(reservations) ? 'reserved.stock' : 'product.unavailable';
                    this.sendEvent(event, name, 'stock.reservation.service', { 
                        reservations: reservations.map(e => e.getData()) 
                    });
                    break;
                case 'order.approved':
                    reservations = await this.reservationService.findByOrder(event.orderId as ObjectId);
                    this.sendEvent(event, 'product.withdrawn', 'stock.service', { 
                        reservations: reservations.map(e => e.getData()) 
                    });
                    break;
                case 'order.rejected':
                    await this.reservationService.deleteByOrder(event.orderId as ObjectId);
                    this.sendEvent(event, 'reservation.removed', 'stock.service');
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

    async consumeShipment(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            const event = Event.toEntity(payload);

            event.validate({
                orderId: 'required',
                name: 'required|max:40',
                service: 'required|max:40'
            });

            switch (event.name) {
                case 'registered.delivery':
                    await this.reservationService.updateProductStockByOrder(event.orderId as ObjectId);
                    this.sendEvent(event, 'updated.stock', 'stock.service');
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