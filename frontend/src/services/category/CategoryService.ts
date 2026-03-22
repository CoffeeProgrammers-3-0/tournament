import BaseService from "../BaseService.ts";
import type { CategoryRequestDto, CategoryResponseDto } from "../../entities/category/category.dto.ts";

class CategoryService extends BaseService {
    constructor() {
        super("/categories");
    }

    // GET /api/categories/round/{roundId} — all categories for a round
    getByRound(roundId: number): Promise<CategoryResponseDto[]> {
        return this.get(`/round/${roundId}`);
    }

    // POST /api/categories/round/{roundId}
    create(roundId: number, data: CategoryRequestDto): Promise<CategoryResponseDto> {
        return this.post(`/round/${roundId}`, data);
    }

    // DELETE /api/categories/{id}
    remove(id: number): Promise<void> {
        return this.delete(`/${id}`);
    }

    // POST /api/categories/{id}/criteria — add criteria to category
    addCriteria(categoryId: number, name: string): Promise<CategoryResponseDto> {
        return this.post(`/${categoryId}/criteria`, { name });
    }

    // DELETE /api/categories/{id}/criteria/{criteriaId}
    removeCriteria(categoryId: number, criteriaId: number): Promise<void> {
        return this.delete(`/${categoryId}/criteria/${criteriaId}`);
    }
}

export default new CategoryService();
