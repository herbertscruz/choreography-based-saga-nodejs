import { Db, ObjectId } from 'mongodb';
import { Account } from '../domain/Account';
import { Customer } from '../domain/Customer';
import { AccountRepository } from './infrastructure/AccountRepository';
import { CustomerRepository } from './infrastructure/CustomerRepository';

export async function migrations(db: Db): Promise<void> {

    const customerRepository = new CustomerRepository(db);
    const accountRepository = new AccountRepository(db);

    const customer = new Customer();
    customer.name = 'Herberts Cruz';
    customer.email = 'herbertscruz@gmail.com';
    customer.createdAt = Date.now();
    customer.updatedAt = Date.now();

    const customerResult = await customerRepository.findByEmail(customer.email);

    if (customerResult) {
        customer.id = customerResult.id;
    } else {
        await customerRepository.insert(customer);
    }

    const account = new Account();
    account.customerId = customer.id;
    account.balance = 150.50;
    account.createdAt = Date.now();
    account.updatedAt = Date.now();

    const accountResult = await accountRepository.findByCustomer(customer.id as ObjectId);

    if (accountResult) {
        account.id = accountResult.id;
    } else {
        await accountRepository.insert(account);
    }

}