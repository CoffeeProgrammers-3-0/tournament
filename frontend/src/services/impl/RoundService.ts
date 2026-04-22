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
import type {LeaderBoardResponseDto, TeamListResponseDto} from "../../entities/team/team.dto.ts";

interface RoundQueryParams {
    page: number;
    size: number;
    search?: string;
    status: RoundStatus;
}

interface LeaderboardQueryParams {
    last_team_points: number;
    last_team_id: number;
    size: number;
}

interface TeamSearchParams {
    page: number;
    size: number;
    search?: string;
}

class RoundService extends BaseService {
    constructor() {
        super('/tournaments');
    }

    // --- Робота з раундами (CRUD) ---

    public createRound(tournamentId: number, data: RoundCreateRequestDto): Promise<RoundFullResponseDto> {
        return this.post<RoundFullResponseDto>(`/${tournamentId}/rounds`, data);
    }

    public updateRound(roundId: number, data: RoundUpdateRequestDto): Promise<RoundFullResponseDto> {
        return this.put<RoundFullResponseDto>(`/rounds/${roundId}`, data);
    }

    public deleteRound(roundId: number): Promise<void> {
        return this.delete<void>(`/rounds/${roundId}`);
    }

    public getRoundsByTournament(tournamentId: number, params: RoundQueryParams): Promise<PaginationListResponseDto<RoundListResponseDto>> {
        return this.get<PaginationListResponseDto<RoundListResponseDto>>(`/${tournamentId}/rounds`, { params });
    }

    public getRoundsByRound(roundId: number, params: RoundQueryParams): Promise<PaginationListResponseDto<RoundListResponseDto>> {
        return this.get<PaginationListResponseDto<RoundListResponseDto>>(`/rounds-by-round/${roundId}`, { params });
    }

    public getRoundById(roundId: number): Promise<RoundFullResponseDto> {
        return this.get<RoundFullResponseDto>(`/rounds/${roundId}`);
    }

    // --- Керування статусами раундів (Missing Methods) ---

    public startRound(roundId: number): Promise<void> {
        return this.get<void>(`/rounds/${roundId}/start-round`);
    }

    public closeSubmissions(roundId: number): Promise<void> {
        return this.get<void>(`/rounds/${roundId}/close-submissions`);
    }

    public evaluateRound(roundId: number): Promise<void> {
        return this.get<void>(`/rounds/${roundId}/evaluate`);
    }

    public rollbackCloseSubmissions(roundId: number): Promise<void> {
        return this.get<void>(`/rounds/${roundId}/rollback-close-submissions`);
    }

    public rollbackStartRound(roundId: number): Promise<void> {
        return this.get<void>(`/rounds/${roundId}/rollback-start-round`);
    }

    public setRoundToDraft(roundId: number): Promise<void> {
        return this.get<void>(`/rounds/${roundId}/draft`);
    }

    // --- Журі ---

    public setJuryToRound(roundId: number, juryId: number): Promise<void> {
        return this.post<void>(`/rounds/${roundId}/juries/${juryId}`);
    }

    public removeJuryFromRound(roundId: number, juryId: number): Promise<void> {
        return this.delete<void>(`/rounds/${roundId}/juries/${juryId}`);
    }

    public autoAssignJuries(roundId: number, k: number): Promise<void> {
        return this.post<void>(`/rounds/${roundId}/auto-assign-juries`, {}, { params: { k } });
    }

    public getJuriesByRound(roundId: number, params: {query?: string, page: number, size: number}): Promise<PaginationListResponseDto<UserResponseDto>> {
        return this.get<PaginationListResponseDto<UserResponseDto>>(`/rounds/${roundId}/juries`, { params });
    }

    // --- Лідерборд ---

    public getLeaderboardForRound(roundId: number, params: LeaderboardQueryParams): Promise<LeaderBoardResponseDto> {
        return this.get<LeaderBoardResponseDto>(`/rounds/${roundId}/leaderboard`, { params });
    }

    public exportLeaderboard(roundId: number): Promise<Blob> {
        return this.get<Blob>(`/rounds/${roundId}/leaderboard/export`, { responseType: 'blob' });
    }

    // --- Керування командами в раунді ---

    public assignTeams(roundId: number, teamIds: number[]): Promise<void> {
        // Spring очікує team_ids як RequestParam (масив у URL)
        return this.put<void>(`/rounds/${roundId}/assign-teams`, {}, {
            params: { team_ids: teamIds }
        });
    }

    public unassignTeams(roundId: number, teamIds: number[]): Promise<void> {
        return this.delete<void>(`/rounds/${roundId}/unassign-teams`, {
            params: { team_ids: teamIds }
        });
    }

    public assignAllTeams(roundId: number): Promise<void> {
        return this.put<void>(`/rounds/${roundId}/assign-all-teams`);
    }

    public unassignAllTeams(roundId: number): Promise<void> {
        return this.delete<void>(`/rounds/${roundId}/unassign-all-teams`);
    }

    public getTeamsInRound(roundId: number, params: TeamSearchParams): Promise<PaginationListResponseDto<TeamListResponseDto>> {
        return this.get<PaginationListResponseDto<TeamListResponseDto>>(`/rounds/${roundId}/teams`, { params });
    }

    public getTeamsNotInRound(roundId: number, params: TeamSearchParams): Promise<PaginationListResponseDto<TeamListResponseDto>> {
        return this.get<PaginationListResponseDto<TeamListResponseDto>>(`/rounds/${roundId}/not-teams`, { params });
    }
}

export const roundService = new RoundService();