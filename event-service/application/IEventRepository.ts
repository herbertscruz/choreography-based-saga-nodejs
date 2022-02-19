import { Event } from "../../common/domain/Event";

export interface IEventRepository {
    insert(event: Event): Promise<void>;
} 