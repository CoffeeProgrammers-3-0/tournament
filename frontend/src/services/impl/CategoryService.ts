import BaseService from '../BaseService';
import type {CategoryRequestDto, CategoryResponseDto} from "../../entities/category/category.dto.ts";

class CategoryService extends BaseService {
    constructor() {
        super('');
    }

    private getBaseUrl(roundId: number): string {
        return `/api/rounds/${roundId}/categories`;
    }

    public createCategory(roundId: number, data: CategoryRequestDto): Promise<CategoryResponseDto> {
        return this.post<CategoryResponseDto>(this.getBaseUrl(roundId), data);
    }

    public updateCategory(roundId: number, categoryId: number, data: CategoryRequestDto): Promise<CategoryResponseDto> {
        return this.put<CategoryResponseDto>(`${this.getBaseUrl(roundId)}/${categoryId}`, data);
    }

    public deleteCategory(roundId: number, categoryId: number): Promise<void> {
        return this.delete<void>(`${this.getBaseUrl(roundId)}/${categoryId}`);
    }

    public getCategories(roundId: number, search?: string): Promise<CategoryResponseDto[]> {
        return this.get<CategoryResponseDto[]>(this.getBaseUrl(roundId), {
            params: { search }
        });
    }
}

export const categoryService = new CategoryService();