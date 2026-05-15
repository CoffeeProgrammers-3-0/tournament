import type {TournamentListResponseDto} from "../tournament/tournament.dto.ts";

export type RoundStatus = 'DRAFT' | 'ACTIVE' | 'SUBMISSION_CLOSED' | 'EVALUATED';

export interface RoundCreateRequestDto {
    name: string;
    startDate: string;
    endDate: string;
    countOfWinners: number;
    requirements: string;
    task: string;
}

export interface RoundUpdateRequestDto {
    name: string;
    startDate: string;
    endDate: string;
    countOfWinners: number;
    requirements: string;
    task: string;
}

export interface RoundFullResponseDto {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    countOfWinners: number;
    requirements: string;
    task: string;
    status: RoundStatus;
    tournament: TournamentListResponseDto;
}

export interface RoundListResponseDto {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: RoundStatus;
}