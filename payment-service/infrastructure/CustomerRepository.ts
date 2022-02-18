import { get, omit } from "lodash";
import { Customer } from "../../common/domain/Customer";
import { ICustomerRepository } from "../application/ICustomerRepository";

export class CustomerRepository implements ICustomerRepository {

    constructor(private db) { }

    async insert(customer: Customer): Promise<void> {
        const result = await this.db.collection('customer').insertOne(omit(customer.getData(), ['id', '_id']));
        customer.id = get(result, 'insertedId');
    }

    async findByEmail(email: string): Promise<Customer> {
        const result = await this.db.collection('customer').findOne({ email });
        if (!result) return null;
        return Customer.toEntity(result);
    }

}