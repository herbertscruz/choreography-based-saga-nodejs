import { get, omit } from "lodash";
import { Event } from "../../domain/Event";
import { DeliveryService } from "./DeliveryService";
import { IEventHandler } from "./IEventHandler";

export class ShipmentResource {

    constructor(private handler: IEventHandler, private deliveryService: DeliveryService) {}

    async consumeStock(message) {
        try {
            const payload = JSON.parse(message.content.toString());
            const event = Event.toEntity(payload);

            this.validateEvent(event);

            let reservations;
            
            switch (event.name) {
                case 'product.withdrawn':
                    reservations = get(event, 'metadata.reservations', []);
                    await this.deliveryService.insertAll(reservations);
                    this.sendEvent(event, 'registered.delivery', 'shipment.service');
                    this.handler.send(event);
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