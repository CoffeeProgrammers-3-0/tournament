import BaseService from '../BaseService';
import type {CriteriaResponseDto} from "../../entities/criteria/criteria.dto.ts";
import type {StringRequestDto} from "../../entities/wrappers/wrapper.dto.ts";

class CriteriaService extends BaseService {
    constructor() {
        super('');
    }

    private getBaseUrl(categoryId: number): string {
        return `/categories/${categoryId}/criteria`;
    }

    public createCriteria(categoryId: number, data: StringRequestDto): Promise<CriteriaResponseDto> {
        return this.post<CriteriaResponseDto>(this.getBaseUrl(categoryId), data);
    }

    public updateCriteria(categoryId: number, criteriaId: number, data: StringRequestDto): Promise<CriteriaResponseDto> {
        return this.put<CriteriaResponseDto>(`${this.getBaseUrl(categoryId)}/${criteriaId}`, data);
    }

    public deleteCriteria(categoryId: number, criteriaId: number): Promise<void> {
        return this.delete<void>(`${this.getBaseUrl(categoryId)}/${criteriaId}`);
    }
}

export const criteriaService = new CriteriaService();