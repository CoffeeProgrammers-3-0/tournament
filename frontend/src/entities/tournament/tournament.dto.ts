// ==== ENUM ====

export type TournamentStatus = 'DRAFT' | 'REGISTRATION' | 'RUNNING' | 'FINISHED';

// ==== CREATE ====

export interface TournamentCreateRequestDto {
    name: string;
    description: string;
    startTournament: string;
    startRegistration: string;
    endRegistration: string;
    maxCountOfTeam: number;
    countOfRounds: number;
}

// ==== UPDATE ====

export interface TournamentUpdateRequestDto {
    name: string;
    description: string;
    startTournament: string;
    startRegistration: string;
    endRegistration: string;
    maxCountOfTeam: number;
    countOfRounds: number;
    status: TournamentStatus;
}

// ==== FULL RESPONSE ====

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

// ==== LIST RESPONSE ====

export interface TournamentListResponseDto {
    id: number;
    name: string;
    startTournament: string;
    startRegistration: string;
    endRegistration: string;
    status: TournamentStatus;
}