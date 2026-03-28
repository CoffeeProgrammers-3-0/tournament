import BaseService from '../BaseService';
import type {
    SubmissionFullResponseDto,
    SubmissionListResponseDto,
    SubmissionRequestDto
} from "../../entities/submission/submission.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";
import type {UserResponseDto} from "../../entities/user/user.dto.ts";

interface PaginationParams {
    page: number;
    size: number;
}

interface JurySearchParams extends PaginationParams {
    query?: string;
}

class SubmissionService extends BaseService {
    constructor() {
        super('/submissions');
    }

    // Повертає ID сабмішну або -1, тому краще number (з маленької літери)
    public checkSubmission(roundId: number): Promise<number> {
        return this.get<number>(`/check/${roundId}`);
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

    // --- Керування журі для сабмішну ---

    public assignJury(submissionId: number, juryId: number): Promise<SubmissionFullResponseDto> {
        return this.post<SubmissionFullResponseDto>(`/${submissionId}/juries/${juryId}`);
    }

    public removeJury(submissionId: number, juryId: number): Promise<SubmissionFullResponseDto> {
        return this.delete<SubmissionFullResponseDto>(`/${submissionId}/juries/${juryId}`);
    }

    public getJuriesBySubmission(submissionId: number, params: JurySearchParams): Promise<PaginationListResponseDto<UserResponseDto>> {
        return this.get<PaginationListResponseDto<UserResponseDto>>(`/${submissionId}/juries`, { params });
    }

    public getAvailableJuries(submissionId: number, params: JurySearchParams): Promise<PaginationListResponseDto<UserResponseDto>> {
        return this.get<PaginationListResponseDto<UserResponseDto>>(`/${submissionId}/available-juries`, { params });
    }
}

export const submissionService = new SubmissionService();