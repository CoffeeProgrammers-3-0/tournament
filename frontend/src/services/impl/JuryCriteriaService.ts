// services/JuryCriteriaService.ts
import BaseService from '../BaseService';
import type {JuryCriteriaRequestDto, JuryCriteriaResponseDto} from "../../entities/juryCriteria/juryCriteria.dto.ts";

class JuryCriteriaService extends BaseService {
    constructor() {
        super('/jury-criteria');
    }

    public updateScore(submissionId: number, criteriaId: number, data: JuryCriteriaRequestDto): Promise<JuryCriteriaResponseDto> {
        return this.put<JuryCriteriaResponseDto>(
            `/submission/${submissionId}/criteria/${criteriaId}`,
            data
        );
    }

    public getMyScoresForSubmission(submissionId: number): Promise<JuryCriteriaResponseDto[]> {
        return this.get<JuryCriteriaResponseDto[]>(`/submission/${submissionId}`);
    }
}

export const juryCriteriaService = new JuryCriteriaService();