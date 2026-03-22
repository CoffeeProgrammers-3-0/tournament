import BaseService from "../BaseService.ts";
import type {
    SubmissionRequestDto,
    SubmissionFullResponseDto,
    SubmissionListResponseDto,
} from "../../entities/submission/submission.dto.ts";

class SubmissionService extends BaseService {
    constructor() {
        super("/submissions");
    }

    // GET /api/submissions/round/{roundId} — all submissions for a round (admin/jury)
    getByRound(roundId: number): Promise<SubmissionListResponseDto[]> {
        return this.get(`/round/${roundId}`);
    }

    // GET /api/submissions/{id}
    getById(id: number): Promise<SubmissionFullResponseDto> {
        return this.get(`/${id}`);
    }

    // GET /api/submissions/round/{roundId}/my — current team's submission for a round
    getMy(roundId: number): Promise<SubmissionFullResponseDto> {
        return this.get(`/round/${roundId}/my`);
    }

    // POST /api/submissions/round/{roundId} — submit for a round
    create(roundId: number, data: SubmissionRequestDto): Promise<SubmissionFullResponseDto> {
        return this.post(`/round/${roundId}`, data);
    }

    // PUT /api/submissions/{id}
    update(id: number, data: SubmissionRequestDto): Promise<SubmissionFullResponseDto> {
        return this.put(`/${id}`, data);
    }

    // DELETE /api/submissions/{id}
    remove(id: number): Promise<void> {
        return this.delete(`/${id}`);
    }
}

export default new SubmissionService();
