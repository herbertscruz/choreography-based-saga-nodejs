import { ObjectId } from "mongodb";
import { Product } from "../../domain/Product";

export interface IProductRepository {
    insert(product: Product): Promise<void>;
    findByName(name: string): Promise<Product>;
    findById(id: ObjectId): Promise<Product>;
    update(id: ObjectId, product: Product):Promise<void>;
} 