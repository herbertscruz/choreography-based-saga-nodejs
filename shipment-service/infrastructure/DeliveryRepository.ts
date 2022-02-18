import { get, omit } from "lodash";
import { IDeliveryRepository } from "../application/IDeliveryRepository";
import { Delivery } from "../../common/domain/Delivery";

export class DeliveryRepository implements IDeliveryRepository {

    constructor(private db) { }

    async insert(delivery: Delivery): Promise<void> {
        const result = await this.db.collection('delivery').insertOne(omit(delivery.getData(), ['id', '_id']));
        delivery.id = get(result, 'insertedId');
    }

}