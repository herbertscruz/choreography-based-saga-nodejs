import { ObjectId } from "mongodb";
import { IHttpClient } from "../../common/application/IHttpClient";
import { Product } from '../../common/domain/Product';

export class ProductService {
    
    constructor(private client: IHttpClient<Product>) {}

    async findById(id: ObjectId): Promise<Product> {
        const url = new URL(`/products/${id.toString()}`, 'http://localhost:3004');
        const { status, data } = await this.client.get(url);

        if (status < 200 && status >= 300) return null;

        return Product.toEntity(data);
    }
}