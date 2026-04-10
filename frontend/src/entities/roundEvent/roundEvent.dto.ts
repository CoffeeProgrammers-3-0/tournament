import type {UserResponseDto} from '../user/user.dto';

export type RoundEventType = 'OFFLINE' | 'ONLINE';

export interface RoundEventFullResponseDto {
    id: number;
    startDate: string;
    endDate: string;
    type: RoundEventType;
    description: string;
    title: string;
    location: string;
    platformUrl: string;
    creator: UserResponseDto;
}

export interface RoundEventListResponseDto {
    id: number;
    startDate: string;
    endDate: string;
    type: RoundEventType;
    title: string;
    creator: UserResponseDto;
}

export interface RoundEventRequestDto {
    startDate: string;
    endDate: string;
    type: RoundEventType;
    description?: string;
    title: string;
    location?: string;
    platformUrl?: string;
}