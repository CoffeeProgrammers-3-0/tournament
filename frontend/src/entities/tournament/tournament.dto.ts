export type TournamentStatus = 'DRAFT' | 'REGISTRATION' | 'RUNNING' | 'FINISHED';

export interface TournamentCreateRequestDto {
    name: string;
    description: string;
    startTournament: string;
    startRegistration: string;
    endRegistration: string;
    maxCountOfTeam: number;
    countOfRounds: number;
}

export interface TournamentUpdateRequestDto {
    name: string;
    description: string;
    startTournament: string;
    startRegistration: string;
    endRegistration: string;
    maxCountOfTeam: number;
    countOfRounds: number;
}

export interface TournamentFullResponseDto {
    id: number;
    name: string;
    description: string;
    startTournament: string;
    startRegistration: string;
    endRegistration: string;
    maxCountOfTeam: number;
    countOfRounds: number;
    status: TournamentStatus;
}

export interface TournamentListResponseDto {
    id: number;
    name: string;
    startTournament: string;
    startRegistration: string;
    endRegistration: string;
    status: TournamentStatus;
}