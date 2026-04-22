import type {CriteriaResponseDto} from '../criteria/criteria.dto';

export interface JuryCriteriaResponseDto {
    jurySubmissionId: number;
    criteria: CriteriaResponseDto;
    points: number;
    additional: boolean;
    comment: string;
}

export interface JuryCriteriaRequestDto {
    points: number;
    additional: boolean;
    comment: string;
}