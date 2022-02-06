import { Delivery } from "../../domain/Delivery";
import { IEventHandler } from "./IEventHandler";
import { IDeliveryRepository } from "./IDeliveryRepository";
import { Event } from "../../domain/Event";
import { Reservation } from "../../domain/Reservation";
import { get } from "lodash";
import { EDeliveryStatus } from "../../domain/EDeliveryStatus";

export class DeliveryService {
    
    constructor(private handler: IEventHandler, private repository: IDeliveryRepository) {}

    async consumeStock(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            let event = Event.toEntity(payload);

            event.validate({
                orderId: 'required',
                name: 'required|max:40',
                service: 'required|max:40'
            });

            switch (event.name) {
                case 'product.withdrawn':
                    event = await this.registerDelivery(event);
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


    async registerDelivery(event: Event): Promise<Event> {
        let reservations = get(event, 'metadata.reservations', []);
        reservations = reservations.map(e => {
            const reservation = Reservation.toEntity(e);

            reservation.validate({
                '*.productId': 'required',
                amount: 'required|numeric'
            });

            return reservation;
        });

        await Promise.all(reservations.map((e: Reservation) => {
            const delivery = Delivery.toEntity({
                orderId: e.orderId,
                status: EDeliveryStatus.READY,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            return this.repository.insert(delivery);
        }));

        return Event.toEntity({
            ...event.getData(), 
            name: 'registered.delivery',
            service: 'shipment.service',
            metadata: {}
        });
    }
}