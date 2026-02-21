// ==== ENUM ====

export type TournamentStatus = 'CREATED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'FINISHED';

// ==== CREATE ====

export interface TournamentCreateRequestDto {
    name: string;
    description: string;
    startDate: string;
    startRegistration: string;
    endRegistration: string;
    maxCountOfTeams: number;
    countOfRounds: number;
}

// ==== UPDATE ====

export interface TournamentUpdateRequestDto {
    name: string;
    description: string;
    startDate: string;
    startRegistration: string;
    endRegistration: string;
    maxCountOfTeams: number;
    countOfRounds: number;
    status: TournamentStatus;
}

// ==== FULL RESPONSE ====

export interface TournamentFullResponseDto {
    id: number;
    name: string;
    description: string;
    startDate: string;
    startRegistration: string;
    endRegistration: string;
    maxCountOfTeams: number;
    countOfRounds: number;
    status: TournamentStatus;
}

// ==== LIST RESPONSE ====

export interface TournamentListResponseDto {
    id: number;
    name: string;
    startDate: string;
    startRegistration: string;
    endRegistration: string;
    status: TournamentStatus;
}