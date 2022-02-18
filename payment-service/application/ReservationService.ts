import { ObjectId } from "mongodb";
import { IHttpClient } from "../../common/application/IHttpClient";
import { Reservation } from '../../common/domain/Reservation';
import { isArray } from "lodash";

export class ReservationService {
    
    constructor(private client: IHttpClient<Reservation>) {}

    async findByOrder(orderId: ObjectId): Promise<Reservation[]> {
        const url = new URL(`/reservations?orderId=${orderId.toString()}`, 'http://localhost:3004');
        const { status, data } = await this.client.get(url);

        if (status < 200 && status >= 300) return [];
        if (!isArray(data)) return [];

        return data.map(e => Reservation.toEntity(e));
    }
}