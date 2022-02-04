import { Event } from "../../domain/Event";

export interface IEventHandler {
    send(event: Event): void;
    ack(message): void;
    nack(message): void;
}