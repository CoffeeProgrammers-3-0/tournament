import type {TournamentStatus} from "../tournament/tournament.dto.ts";

type Role = 'ADMIN' | 'USER' | 'JURY';

export interface UserCreateRequestDto {
    fullName: string;
    email: string;
}

export interface UserCreateRequestForTeamDto {
    fullName: string;
    email: string;
    isLeader: boolean;
}

export interface UserUpdateRequestDto {
    fullName: string;
}

export interface UserResponseDto {
    id: number;
    fullName: string;
    email: string;
    role: Role;
}

export interface UserResponseForTeamDto {
    id: number;
    fullName: string;
    email: string;
    isLeader: boolean;
    tournamentId: number;
    tournamentName: string;
    tournamentStatus: TournamentStatus;
    tournamentMaxCountOfTeam: number;
}