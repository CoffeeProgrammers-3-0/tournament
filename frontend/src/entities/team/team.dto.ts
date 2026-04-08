import type {UserCreateRequestForTeamDto, UserResponseForTeamDto} from '../user/user.dto';

export interface TeamCreateRequestDto {
    name: string;
    email: string;
    organization: string;
    contact: string;
    users: UserCreateRequestForTeamDto[];
}

export interface TeamUpdateRequestDto {
    name: string;
    organization: string;
    contact: string;
}

export interface TeamFullResponseDto {
    id: number;
    name: string;
    email: string;
    organization: string;
    contact: string;
    users: UserResponseForTeamDto[];
}

export interface TeamListResponseDto {
    id: number;
    name: string;
    email: string;
}

export interface TeamLeaderboardResponseDto {
    id: number;
    name: string;
    email: string;
    points: number;
    countOfMembers: number;
}

export interface StatisticResponseDto {
    id: number;
    name: string;
    email: string;
    pointsPerJury: Record<string, Record<string, number>>;
}