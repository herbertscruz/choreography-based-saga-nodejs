import { omit } from "lodash";
import { ObjectId } from "mongodb";
import { Account } from "../../domain/Account";
import { IAccountRepository } from "../application/IAccountRepository";

export class AccountRepository implements IAccountRepository {

    constructor(private db) { }

    async findByCustomer(customerId: ObjectId): Promise<Account> {
        const result = await this.db.collection('account').find({customerId}).toArray();
        return result.map(e => Account.toEntity(e));
    }

    async update(id: ObjectId, account: Account): Promise<void> {
        const data = account.getData();
        await this.db.collection('account').updateOne(
            { _id: id },
            { $set: omit(data, ['id', '_id']) }
        );
    }

}