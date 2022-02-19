import { ObjectId } from "mongodb";
import { Reservation } from "../../common/domain/Reservation";

export interface IReservationRepository {
    insert(reservation: Reservation): Promise<void>;
    findByOrder(orderId: ObjectId): Promise<Reservation[]>;
    deleteByOrder(orderId: ObjectId): Promise<void>;
    findByProduct(productId: ObjectId): Promise<Reservation[]>;
}