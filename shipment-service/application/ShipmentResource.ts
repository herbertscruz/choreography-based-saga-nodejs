import { get } from "lodash";
import { Event } from "../../common/domain/Event";
import { DeliveryService } from "./DeliveryService";
import { IHandler } from "../../common/application/IHandler";
import { AbstractResource } from '../../common/application/AbstractResource';

export class ShipmentResource extends AbstractResource {

    constructor(protected handler: IHandler, private deliveryService: DeliveryService) {
        super(handler);
    }

    async consumeStock(message) {
        const payload = JSON.parse(message.content.toString());
        const event = Event.toEntity(payload);

        this.validateEvent(event);

        let reservations;

        switch (event.routingKey) {
            case 'stock.withdrawn':
                reservations = get(event, 'metadata.reservations', []);
                await this.deliveryService.insertAll(reservations);
                this.sendEvent(event, 'shipment.registered');
                break;
        }
    }

}