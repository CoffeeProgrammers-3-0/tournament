import type {CriteriaResponseDto} from '../criteria/criteria.dto';

export interface JuryCriteriaResponseDto {
    id: number;
    criteria: CriteriaResponseDto;
    points: number;
}