import type {UserResponseDto} from '../user/user.dto';
import type {RoundListResponseDto} from '../round/round.dto';

export type AdminMessageTargetType = 'GENERAL' | 'ROUND';

export interface AdminMessageRequestDto {
    content: string;
}

export interface GlobalAdminMessageResponseDto {
    id: number;
    creator: UserResponseDto;
    date: string; // ISO format
    targetType: AdminMessageTargetType;
    content: string;
}

export interface RoundAdminMessageResponseDto {
    id: number;
    creator: UserResponseDto;
    date: string; // ISO format
    targetType: AdminMessageTargetType;
    content: string;
    round: RoundListResponseDto;
}