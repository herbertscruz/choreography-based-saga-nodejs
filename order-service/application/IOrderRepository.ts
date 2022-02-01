import { Order } from "../domain/Order";

export interface IOrderRepository {
    insert(order: Order):Promise<void>;
} 