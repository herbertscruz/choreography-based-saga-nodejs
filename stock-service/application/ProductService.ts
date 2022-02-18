import { ObjectId } from "mongodb";
import { Product } from "../../common/domain/Product";
import { IProductRepository } from "./IProductRepository";

export class ProductService {

    constructor(
        private productRepository: IProductRepository
    ) { }

    findById(id: ObjectId): Promise<Product> {
        return this.productRepository.findById(id as ObjectId);
    }

}