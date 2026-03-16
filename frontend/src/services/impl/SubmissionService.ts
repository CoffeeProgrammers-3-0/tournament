import BaseService from '../BaseService';
import type {
    SubmissionFullResponseDto,
    SubmissionListResponseDto,
    SubmissionRequestDto
} from "../../entities/submission/submission.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

interface PaginationParams {
    page: number;
    size: number;
}

class SubmissionService extends BaseService {
    constructor() {
        super('/api/submissions');
    }

    public sendSubmission(roundId: number, data: SubmissionRequestDto): Promise<SubmissionFullResponseDto> {
        return this.post<SubmissionFullResponseDto>(`/send/${roundId}`, data);
    }

    public updateSubmission(submissionId: number, data: SubmissionRequestDto): Promise<SubmissionFullResponseDto> {
        return this.put<SubmissionFullResponseDto>(`/${submissionId}`, data);
    }

    public deleteSubmission(submissionId: number): Promise<void> {
        return this.delete<void>(`/${submissionId}`);
    }

    public getSubmissionById(submissionId: number): Promise<SubmissionFullResponseDto> {
        return this.get<SubmissionFullResponseDto>(`/${submissionId}`);
    }

    public getSubmissionsForJury(params: PaginationParams): Promise<PaginationListResponseDto<SubmissionListResponseDto>> {
        return this.get<PaginationListResponseDto<SubmissionListResponseDto>>('/my', { params });
    }

    public getSubmissionsByRound(roundId: number, params: PaginationParams): Promise<PaginationListResponseDto<SubmissionListResponseDto>> {
        return this.get<PaginationListResponseDto<SubmissionListResponseDto>>(`/rounds/${roundId}`, { params });
    }

    public assignJury(submissionId: number, juryId: number): Promise<SubmissionFullResponseDto> {
        return this.post<SubmissionFullResponseDto>(`/${submissionId}/juries/${juryId}`);
    }

    public removeJury(submissionId: number, juryId: number): Promise<SubmissionFullResponseDto> {
        return this.delete<SubmissionFullResponseDto>(`/${submissionId}/juries/${juryId}`);
    }
}

export const submissionService = new SubmissionService();