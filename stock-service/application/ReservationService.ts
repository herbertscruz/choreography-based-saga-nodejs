import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { Order } from "../../domain/Order";
import { Reservation } from "../../domain/Reservation";
import { IProductRepository } from "./IProductRepository";
import { IReservationRepository } from "./IReservationRepository";

export class ReservationService {

    constructor(
        private reservationRepository: IReservationRepository,
        private productRepository: IProductRepository
    ) { }

    findByOrder(orderId: ObjectId): Promise<Reservation[]> {
        return this.reservationRepository.findByOrder(orderId as ObjectId);
    }

    async makeReservation(order: Order): Promise<Reservation[]> {
        order.validate({
            items: 'array|min:1',
            'items.*.productId': 'required',
            quantity: 'required|integer|min:1'
        });

        let reservations = [];

        for (const item of order.items) {
            const product = await this.productRepository.findById(item.productId as ObjectId);
            const reservationsResult = await this.reservationRepository.findByProduct(item.productId as ObjectId);
            const totalReserved = reservationsResult.reduce((result, item) => result + item.quantity, 0);

            const haveStock = (product.quantity - totalReserved) >= 0;
            if (!haveStock) {
                reservations = [];
                break;
            }

            reservations.push(Reservation.toEntity({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                createdAt: Date.now()
            }));
        }

        if (!isEmpty(reservations)) {
            await Promise.all(reservations.map(e => this.reservationRepository.insert(e)));
        }

        return reservations;
    }

    deleteByOrder(orderId: ObjectId): Promise<void> {
        return this.reservationRepository.deleteByOrder(orderId as ObjectId);
    }

    async updateProductStockByOrder(orderId: ObjectId): Promise<void> {
        const reservations = await this.reservationRepository.findByOrder(orderId);

        for (const reservation of reservations) {
            const product = await this.productRepository.findById(reservation.productId as ObjectId);
            const quantity = product.quantity - reservation.quantity;
            product.quantity = quantity;
            await this.productRepository.update(product.id as ObjectId, product);
        }

        await this.reservationRepository.deleteByOrder(orderId);
    }

}