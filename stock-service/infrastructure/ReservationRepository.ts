import { get, omit } from "lodash";
import { ObjectId } from "mongodb";
import { IReservationRepository } from "../application/IReservationRepository";
import { Reservation } from "../../domain/Reservation"

export class ReservationRepository implements IReservationRepository {

    constructor(private db) { }

    async insert(reservation: Reservation): Promise<void> {
        const result = await this.db.collection('reservation').insertOne(omit(reservation.getData(), ['id', '_id']));
        reservation.id = get(result, 'insertedId');
    }

    async findByOrder(orderId: ObjectId): Promise<Reservation[]> {
        const result = await this.db.collection('reservation').find({orderId}).toArray();
        return result.map(e => Reservation.toEntity(e));
    }

    async deleteByOrder(orderId: ObjectId): Promise<void> {
        this.db.collection('reservation').deleteMany({orderId});
    }

    async findByProduct(productId: ObjectId): Promise<Reservation[]> {
        const result = await this.db.collection('reservation').find({productId}).toArray();
        return result.map(e => Reservation.toEntity(e));
    }

}