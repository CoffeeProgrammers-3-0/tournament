import type {CriteriaResponseDto} from '../criteria/criteria.dto';

export interface CategoryRequestDto {
    title: string;
    weight: number;
}

export interface CategoryResponseDto {
    id: number;
    title: string;
    weight: number;
    criteria: CriteriaResponseDto[];
}