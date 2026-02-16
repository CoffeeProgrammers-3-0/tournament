import type {EventType} from "../enums/EventType.tsx";

export type WsEvent<T> = {
    type: EventType;
    content: T;
}