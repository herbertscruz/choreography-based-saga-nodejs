import { get, omit } from "lodash";
import { IDeliveryRepository } from "../application/IDeliveryRepository";
import { Delivery } from "../../common/domain/Delivery";
import { Db } from "mongodb";

export class DeliveryRepository implements IDeliveryRepository {

    constructor(
        private db: Db
    ) { }

    async insert(delivery: Delivery): Promise<void> {
        const result = await this.db.collection('delivery').insertOne(omit(delivery.getData(), ['id', '_id']));
        delivery.id = get(result, 'insertedId');
    }

}