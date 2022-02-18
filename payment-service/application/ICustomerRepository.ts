import { Customer } from "../../common/domain/Customer";

export interface ICustomerRepository {
    insert(customer: Customer): Promise<void>;
    findByEmail(email: string): Promise<Customer>;
} 