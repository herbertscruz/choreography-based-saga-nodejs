import { Event } from "../domain/Event";

export interface IEventRepository {
    insert(event: Event):Promise<void>;
} 