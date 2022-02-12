import { Db } from 'mongodb';
import { Product } from '../domain/Product';
import { ProductRepository } from './infrastructure/ProductRepository';

export async function migrations(db: Db): Promise<void> {

    const productRepository = new ProductRepository(db);

    const product = new Product();
    product.name = 'Ruffles Potato Chips';
    product.price = 7.99;
    product.quantity = 5;
    product.createdAt = Date.now();
    product.updatedAt = Date.now();

    const productResult = await productRepository.findByName(product.name);

    if (productResult) {
        product.id = productResult.id;
    } else {
        await productRepository.insert(product);
    }

}