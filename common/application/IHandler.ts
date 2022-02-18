import { Event } from "../domain/Event";

export interface IHandler {
    publish(event: Event, routingKey: string): boolean;
}