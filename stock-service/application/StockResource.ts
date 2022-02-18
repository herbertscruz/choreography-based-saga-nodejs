import { get, isEmpty, omit } from "lodash";
import { ObjectId } from "mongodb";
import { Event } from "../../common/domain/Event";
import { Order } from "../../common/domain/Order";
import { Product } from "../../common/domain/Product";
import { Reservation } from "../../common/domain/Reservation";
import { IHandler } from "../../common/application/IHandler";
import { ProductService } from "./ProductService";
import { ReservationService } from "./ReservationService";

export class StockResource {

    constructor(
        private handler: IHandler, 
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
                name = isEmpty(reservations) ? 'stock.unreserved' : 'stock.reserved';
                this.sendEvent(event, name, { 
                    reservations: reservations.map(e => e.getData()) 
                });
                break;
            case 'order.approved':
                reservations = await this.reservationService.findByOrder(event.orderId as ObjectId);
                this.sendEvent(event, 'stock.withdrawn', { 
                    reservations: reservations.map(e => e.getData()) 
                });
                break;
            case 'order.rejected':
                await this.reservationService.deleteByOrder(event.orderId as ObjectId);
                this.sendEvent(event, 'stock.removed');
                break;
        }
    }

    async consumeShipment(message) {
        const payload = JSON.parse(message.content.toString());
        const event = Event.toEntity(payload);

        event.validate({
            orderId: 'required',
            name: 'required|max:40',
            service: 'required|max:40'
        });

        switch (event.name) {
            case 'shipment.registered':
                await this.reservationService.updateProductStockByOrder(event.orderId as ObjectId);
                this.sendEvent(event, 'updated.stock');
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
            name: routingKey, service: 'stock.service', metadata
        });

        this.handler.publish(event, routingKey);
    }

}