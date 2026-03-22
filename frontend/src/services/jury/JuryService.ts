import BaseService from "../BaseService.ts";
import type { UserResponseDto } from "../../entities/user/user.dto.ts";
import type { JuryCriteriaResponseDto } from "../../entities/juryCriteria/juryCriteria.dto.ts";

class JuryService extends BaseService {
    constructor() {
        super("/jury");
    }

    // GET /api/jury/round/{roundId} — all jury members assigned to a round
    getByRound(roundId: number): Promise<UserResponseDto[]> {
        return this.get(`/round/${roundId}`);
    }

    // POST /api/jury/round/{roundId} — assign jury to round by email
    assign(roundId: number, email: string): Promise<void> {
        return this.post(`/round/${roundId}`, { text: email });
    }

    // DELETE /api/jury/round/{roundId}/user/{userId} — remove jury from round
    remove(roundId: number, userId: number): Promise<void> {
        return this.delete(`/round/${roundId}/user/${userId}`);
    }

    // POST /api/jury/round/{roundId}/submission/{submissionId}/score — jury submits scores
    // scores: { criteriaId: points, ... }
    submitScores(roundId: number, submissionId: number, scores: Record<number, number>): Promise<void> {
        return this.post(`/round/${roundId}/submission/${submissionId}/score`, scores);
    }

    // GET /api/jury/round/{roundId}/submission/{submissionId}/score — jury's own scores for a submission
    getMyScores(roundId: number, submissionId: number): Promise<JuryCriteriaResponseDto[]> {
        return this.get(`/round/${roundId}/submission/${submissionId}/score`);
    }
}

export default new JuryService();
