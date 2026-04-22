import type {CriteriaResponseDto} from '../criteria/criteria.dto';

export interface JuryCriteriaResponseDto {
    id: any;
    jurySubmissionId: number;
    criteria: CriteriaResponseDto;
    points: number;
    additional: boolean;
    comment: string;
}

export interface JuryCriteriaRequestDto {
    id?: number | null;
    submissionId: number;
    criteriaId: number | null;
    points: number;
    additional: boolean;
    comment: string;
}