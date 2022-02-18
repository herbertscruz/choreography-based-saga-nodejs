import { Delivery } from "../../common/domain/Delivery";
import { IDeliveryRepository } from "./IDeliveryRepository";
import { Reservation } from "../../common/domain/Reservation";
import { EDeliveryStatus } from "../../common/domain/EDeliveryStatus";
import { omit } from "lodash";

export class DeliveryService {
    
    constructor(private repository: IDeliveryRepository) {}

    async insertAll(reservations: Reservation[]): Promise<void> {
        reservations = reservations.map(e => {
            const reservation = Reservation.toEntity(e);

            reservation.validate({
                '*.productId': 'required',
                quantity: 'required|integer|min:1'
            });

            return reservation;
        });

        await Promise.all(reservations.map((e: Reservation) => {
            const delivery = Delivery.toEntity({
                status: EDeliveryStatus.READY,
                metadata: omit(e.getData(), ['id', 'createdAt']),
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            return this.repository.insert(delivery);
        }));
    }
}