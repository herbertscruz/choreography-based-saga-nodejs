import { AbstractHandler } from "./AbstractHandler";
import { OrderHandler } from "./OrderHandler";
import { PaymentHandler } from "./PaymentHandler";
import { ShipmentHandler } from "./ShipmentHandler";
import { StockHandler } from "./StockHandler";
import { StockReservationHandler } from "./StockReservationHandler";

export class HandlerFactory {

    static createInstance(serviceName: string, args: any[]): AbstractHandler {
        const factories = [
            { serviceName: 'order.service', handler: OrderHandler },
            { serviceName: 'invoice.service', handler: PaymentHandler },
            { serviceName: 'shipment.service', handler: ShipmentHandler },
            { serviceName: 'stock.service', handler: StockHandler },
            { serviceName: 'stock.reservation.service', handler: StockReservationHandler }
        ];
        const factory = factories.find(e => e.serviceName === serviceName);
        if (!factory) throw new Error(`${serviceName} handler not found`);
        return new factory.handler(...args as [any]);
    }
}
