import BaseService from "../BaseService.ts";
import type {
    TournamentCreateRequestDto,
    TournamentFullResponseDto,
    TournamentListResponseDto,
    TournamentUpdateRequestDto,
} from "../../entities/tournament/tournament.dto.ts";
import type { PaginationListResponseDto } from "../../entities/wrappers/wrapper.dto.ts";

class TournamentService extends BaseService {
    constructor() {
        super("/tournaments");
    }

    // GET /api/tournaments?page=0&size=6
    getAll(page = 0, size = 6): Promise<PaginationListResponseDto<TournamentListResponseDto>> {
        return this.get("", { params: { page, size } });
    }

    // GET /api/tournaments/available?page=0&size=6
    getAvailable(page = 0, size = 6): Promise<PaginationListResponseDto<TournamentListResponseDto>> {
        return this.get("/available", { params: { page, size } });
    }

    // GET /api/tournaments/my?page=0&size=6
    getMy(page = 0, size = 6): Promise<PaginationListResponseDto<TournamentListResponseDto>> {
        return this.get("/my", { params: { page, size } });
    }

    // GET /api/tournaments/history?page=0&size=6
    getHistory(page = 0, size = 6): Promise<PaginationListResponseDto<TournamentListResponseDto>> {
        return this.get("/history", { params: { page, size } });
    }

    // GET /api/tournaments/jury — tournaments where current user is assigned as jury
    getJuryTournaments(): Promise<TournamentListResponseDto[]> {
        return this.get("/jury");
    }

    // GET /api/tournaments/{id}
    getById(id: number): Promise<TournamentFullResponseDto> {
        return this.get(`/${id}`);
    }

    // POST /api/tournaments
    create(data: TournamentCreateRequestDto): Promise<TournamentFullResponseDto> {
        return this.post("", data);
    }

    // PUT /api/tournaments/{id}
    update(id: number, data: TournamentUpdateRequestDto): Promise<TournamentFullResponseDto> {
        return this.put(`/${id}`, data);
    }

    // POST /api/tournaments/{id}/register — register current user's team
    register(id: number): Promise<void> {
        return this.post(`/${id}/register`);
    }

    // DELETE /api/tournaments/{id}/unregister
    unregister(id: number): Promise<void> {
        return this.delete(`/${id}/unregister`);
    }

    // GET /api/tournaments/{id}/is-registered
    isRegistered(id: number): Promise<boolean> {
        return this.get(`/${id}/is-registered`);
    }
}

export default new TournamentService();
