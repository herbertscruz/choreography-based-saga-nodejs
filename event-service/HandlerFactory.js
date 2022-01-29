const OrderHandler = require('./OrderHandler');
const PaymentHandler = require('./PaymentHandler');
const ShipmentHandler = require('./ShipmentHandler');
const StockHandler = require('./StockHandler');
const StockReservationHandler = require('./StockReservationHandler');

module.exports = class HandlerFactory {

    static createInstance(serviceName, args) {
        const factories = [
            { serviceName: 'order.service', handler: OrderHandler },
            { serviceName: 'payment.service', handler: PaymentHandler },
            { serviceName: 'shipment.service', handler: ShipmentHandler },
            { serviceName: 'stock.service', handler: StockHandler },
            { serviceName: 'stock.reservation.service', handler: StockReservationHandler }
        ];
        const factory = factories.find(e => e.serviceName === serviceName);
        if (!factory) throw new Error(`${serviceName} handler not found`);
        return new factory.handler(...args);
    }
}
