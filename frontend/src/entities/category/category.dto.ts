import type {CriteriaResponseDto} from '../criteria/criteria.dto';

export interface CategoryRequestDto {
    name: string;
    weight: number;
}

export interface CategoryResponseDto {
    id: number;
    name: string;
    weight: number;
    criteria: CriteriaResponseDto[];
}