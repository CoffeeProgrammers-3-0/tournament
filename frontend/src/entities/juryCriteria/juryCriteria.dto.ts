import type {CriteriaResponseDto} from '../criteria/criteria.dto';

export interface JuryCriteriaResponseDto {
    jurySubmissionId: number;
    criteria: CriteriaResponseDto;
    points: number;
}

export interface JuryCriteriaRequestDto {
    points: number;
}