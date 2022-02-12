import { get, omit } from "lodash";
import { ObjectId } from "mongodb";
import { Account } from "../../domain/Account";
import { IAccountRepository } from "../application/IAccountRepository";

export class AccountRepository implements IAccountRepository {

    constructor(private db) { }

    async insert(account: Account): Promise<void> {
        const result = await this.db.collection('account').insertOne(omit(account.getData(), ['id', '_id']));
        account.id = get(result, 'insertedId');
    }

    async findByCustomer(customerId: ObjectId): Promise<Account> {
        const result = await this.db.collection('account').findOne({customerId});
        if (!result) return null;
        return Account.toEntity(result);
    }

    async update(id: ObjectId, account: Account): Promise<void> {
        const data = account.getData();
        await this.db.collection('account').updateOne(
            { _id: id },
            { $set: omit(data, ['id', '_id']) }
        );
    }

}