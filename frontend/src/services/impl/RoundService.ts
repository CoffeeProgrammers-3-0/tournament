import BaseService from '../BaseService';
import type {
    RoundCreateRequestDto,
    RoundFullResponseDto,
    RoundListResponseDto,
    RoundStatus,
    RoundUpdateRequestDto
} from "../../entities/round/round.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";
import type {UserResponseDto} from "../../entities/user/user.dto.ts";
import type {TeamLeaderboardResponseDto} from "../../entities/team/team.dto.ts";

// Інтерфейс для параметрів запиту списку раундів
interface RoundQueryParams {
    page: number;
    size: number;
    search?: string;
    status: RoundStatus; // В Java цей параметр обов'язковий
}

// Інтерфейс для параметрів лідерборду
interface LeaderboardQueryParams {
    last_team_points: number;
    last_team_id: number;
    size: number;
}

class RoundService extends BaseService {
    constructor() {
        // Додаємо /api, якщо ваш BaseService автоматично не додає префікс
        super('/tournaments');
    }

    // POST: /{tournament_id}/rounds
    public createRound(tournamentId: number, data: RoundCreateRequestDto): Promise<RoundFullResponseDto> {
        return this.post<RoundFullResponseDto>(`/${tournamentId}/rounds`, data);
    }

    // PUT: /rounds/{round_id}
    public updateRound(roundId: number, data: RoundUpdateRequestDto): Promise<RoundFullResponseDto> {
        return this.put<RoundFullResponseDto>(`/rounds/${roundId}`, data);
    }

    // DELETE: /rounds/{round_id}
    public deleteRound(roundId: number): Promise<void> {
        return this.delete<void>(`/rounds/${roundId}`);
    }

    // GET: /{tournament_id}/rounds
    public getRoundsByTournament(tournamentId: number, params: RoundQueryParams): Promise<PaginationListResponseDto<RoundListResponseDto>> {
        return this.get<PaginationListResponseDto<RoundListResponseDto>>(`/${tournamentId}/rounds`, { params });
    }

    // GET: /rounds/{round_id}
    public getRoundById(roundId: number): Promise<RoundFullResponseDto> {
        return this.get<RoundFullResponseDto>(`/rounds/${roundId}`);
    }

    // POST: /rounds/{round_id}/juries/{jury_id}
    public setJuryToRound(roundId: number, juryId: number): Promise<void> {
        return this.post<void>(`/rounds/${roundId}/juries/${juryId}`);
    }

    // DELETE: /rounds/{round_id}/juries/{jury_id}
    public removeJuryFromRound(roundId: number, juryId: number): Promise<void> {
        return this.delete<void>(`/rounds/${roundId}/juries/${juryId}`);
    }

    // POST: /rounds/{round_id}/auto-assign-juries?k=...
    public autoAssignJuries(roundId: number, k: number): Promise<void> {
        return this.post<void>(`/rounds/${roundId}/auto-assign-juries`, {}, { params: { k } });
    }

    // GET: /rounds/{round_id}/leaderboard
    public getLeaderboardForRound(roundId: number, params: LeaderboardQueryParams): Promise<TeamLeaderboardResponseDto[]> {
        return this.get<TeamLeaderboardResponseDto[]>(`/rounds/${roundId}/leaderboard`, { params });
    }

    // GET: /rounds/{round_id}/juries (Виправлено шлях та назву параметра query)
    public getJuriesByRound(roundId: number, params: {query?: string, page: number, size: number}): Promise<PaginationListResponseDto<UserResponseDto>> {
        return this.get<PaginationListResponseDto<UserResponseDto>>(`/rounds/${roundId}/juries`, { params });
    }
}

export const roundService = new RoundService();