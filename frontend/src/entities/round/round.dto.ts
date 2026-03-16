// ==== ENUM ====

type RoundStatus = 'DRAFT' | 'ACTIVE' | 'SUBMISSION_CLOSED' | 'EVALUATED';

// ==== CREATE ====

export interface RoundCreateRequestDto {
    name: string;
    startDate: string;
    endDate: string;
    countOfWinners: number;
    requirements: string;
    task: string;
}

// ==== UPDATE ====

export interface RoundUpdateRequestDto {
    name: string;
    startDate: string;
    endDate: string;
    countOfWinners: number;
    requirements: string;
    task: string;
    status: RoundStatus;
}

// ==== FULL RESPONSE ====

export interface RoundFullResponseDto {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    countOfWinners: number;
    requirements: string;
    task: string;
    status: RoundStatus;
}

// ==== LIST RESPONSE ====

export interface RoundListResponseDto {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: RoundStatus;
}