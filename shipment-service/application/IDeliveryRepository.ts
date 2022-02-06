import { Delivery } from "../../domain/Delivery";

export interface IDeliveryRepository {
    insert(delivery: Delivery):Promise<void>;
} 