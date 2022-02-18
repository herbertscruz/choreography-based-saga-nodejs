import { ObjectId } from "mongodb";
import { IHttpClient } from "../../common/application/IHttpClient";
import { Order } from '../../common/domain/Order';

export class OrderService {
    
    constructor(private client: IHttpClient<Order>) {}

    async findById(id: ObjectId): Promise<Order> {
        const url = new URL(`/orders/${id.toString()}`, 'http://localhost:3000');
        const { status, data } = await this.client.get(url);

        if (status < 200 && status >= 300) return null;

        return Order.toEntity(data);
    }
}