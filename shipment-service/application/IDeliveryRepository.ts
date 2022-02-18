import { Delivery } from "../../common/domain/Delivery";

export interface IDeliveryRepository {
    insert(delivery: Delivery):Promise<void>;
} 