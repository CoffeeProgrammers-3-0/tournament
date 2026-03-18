// services/JuryCriteriaService.ts
import BaseService from '../BaseService';
import type {JuryCriteriaResponseDto} from "../../entities/juryCriteria/juryCriteria.dto.ts";
import type {LongDto} from "../../entities/wrappers/wrapper.dto.ts";

class JuryCriteriaService extends BaseService {
    constructor() {
        super('/jury-criteria');
    }

    public setScore(submissionId: number, criteriaId: number, data: LongDto): Promise<JuryCriteriaResponseDto> {
        return this.post<JuryCriteriaResponseDto>(
            `/submission/${submissionId}/criteria/${criteriaId}`,
            data
        );
    }

    public updateScore(submissionId: number, criteriaId: number, data: LongDto): Promise<JuryCriteriaResponseDto> {
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