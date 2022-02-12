import { ObjectId } from "mongodb";
import { Account } from "../../domain/Account";

export interface IAccountRepository {
    insert(account: Account): Promise<void>;
    findByCustomer(customerId: ObjectId):Promise<Account>;
    update(id: ObjectId, account: Account):Promise<void>;
} 