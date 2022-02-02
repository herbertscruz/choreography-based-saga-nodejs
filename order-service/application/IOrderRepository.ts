import { ObjectId } from "mongodb";
import { Order } from "../domain/Order";

export interface IOrderRepository {
    insert(order: Order):Promise<void>;
    findById(id: ObjectId):Promise<Order>;
    update(id: ObjectId, order: Order):Promise<void>;
} 