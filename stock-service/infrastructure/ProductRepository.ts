import { get, omit } from "lodash";
import { ObjectId } from "mongodb";
import { Product } from "../../domain/Product";
import { IProductRepository } from "../application/IProductRepository";

export class ProductRepository implements IProductRepository {

    constructor(private db) { }

    async insert(product: Product): Promise<void> {
        const result = await this.db.collection('product').insertOne(omit(product.getData(), ['id', '_id']));
        product.id = get(result, 'insertedId');
    }

    async findByName(name: string): Promise<Product> {
        const result = await this.db.collection('product').findOne({ name });
        if (!result) return null;
        return Product.toEntity(result);
    }

    async findById(id: ObjectId): Promise<Product> {
        const result = await this.db.collection('product').findOne({ _id: id });
        if (!result) return null;
        return Product.toEntity(result);
    }

    async update(id: ObjectId, product: Product): Promise<void> {
        const data = product.getData();
        await this.db.collection('product').updateOne(
            { _id: id },
            { $set: omit(data, ['id', '_id']) }
        );
    }

}