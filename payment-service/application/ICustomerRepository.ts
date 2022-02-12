import { Customer } from "../../domain/Customer";

export interface ICustomerRepository {
    insert(customer: Customer): Promise<void>;
    findByEmail(email: string): Promise<Customer>;
} 