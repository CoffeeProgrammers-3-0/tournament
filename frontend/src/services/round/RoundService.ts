import BaseService from "../BaseService.ts";
import type {
    RoundCreateRequestDto,
    RoundFullResponseDto,
    RoundListResponseDto,
    RoundUpdateRequestDto,
} from "../../entities/round/round.dto.ts";

class RoundService extends BaseService {
    constructor() {
        super("/rounds");
    }

    // GET /api/rounds/{id}
    getById(id: number): Promise<RoundFullResponseDto> {
        return this.get(`/${id}`);
    }

    // GET /api/rounds/tournament/{tournamentId} — all rounds for a tournament
    getByTournament(tournamentId: number): Promise<RoundListResponseDto[]> {
        return this.get(`/tournament/${tournamentId}`);
    }

    // POST /api/rounds/tournament/{tournamentId}
    create(tournamentId: number, data: RoundCreateRequestDto): Promise<RoundFullResponseDto> {
        return this.post(`/tournament/${tournamentId}`, data);
    }

    // PUT /api/rounds/{id}
    update(id: number, data: RoundUpdateRequestDto): Promise<RoundFullResponseDto> {
        return this.put(`/${id}`, data);
    }

    // DELETE /api/rounds/{id}
    remove(id: number): Promise<void> {
        return this.delete(`/${id}`);
    }
}

export default new RoundService();
