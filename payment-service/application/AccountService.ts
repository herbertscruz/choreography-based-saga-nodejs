import { ObjectId } from "mongodb";
import { Account } from '../../domain/Account';
import { IAccountRepository } from "./IAccountRepository";

export class AccountService {
    
    constructor(private repository: IAccountRepository) {}

    findByCustomer(customerId: ObjectId): Promise<Account> {
        return this.repository.findByCustomer(customerId);
    }

    update(id: ObjectId, account: Account): Promise<void> {
        account.validate({
            customerId: 'required',
            balance: 'required'
        });
        account.updatedAt = Date.now();

        return this.repository.update(id, account);
    }
}