import { get, isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { Event } from "../../common/domain/Event";
import { Order } from "../../common/domain/Order";
import { Product } from "../../common/domain/Product";
import { Reservation } from "../../common/domain/Reservation";
import { IHandler } from "../../common/application/IHandler";
import { ProductService } from "./ProductService";
import { ReservationService } from "./ReservationService";
import { AbstractResource } from '../../common/application/AbstractResource';

export class StockResource extends AbstractResource {

    constructor(
        protected handler: IHandler,
        private reservationService: ReservationService,
        private productService: ProductService
    ) {
        super(handler);
    }

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
        let routingKey;

        switch (event.routingKey) {
            case 'order.created':
                order = Order.toEntity(get(event, 'metadata.order', {}));
                reservations = await this.reservationService.makeReservation(order);
                routingKey = isEmpty(reservations) ? 'stock.unreserved' : 'stock.reserved';
                this.sendEvent(event, routingKey, {
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

        this.validateEvent(event);

        switch (event.routingKey) {
            case 'shipment.registered':
                await this.reservationService.updateProductStockByOrder(event.orderId as ObjectId);
                this.sendEvent(event, 'stock.updated');
                break;
        }
    }

}