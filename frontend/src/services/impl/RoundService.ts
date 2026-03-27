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
import type {TeamLeaderboardResponseDto, TeamListResponseDto} from "../../entities/team/team.dto.ts";

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

// Параметри для пошуку команд у раунді
interface TeamSearchParams {
    page: number;
    size: number;
    search?: string;
}

class RoundService extends BaseService {
    constructor() {
        super('/tournaments');
    }

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
        return this.get<PaginationListResponseDto<RoundListResponseDto>>(`/roundsByRound/${roundId}`, { params });
    }

    public getRoundById(roundId: number): Promise<RoundFullResponseDto> {
        return this.get<RoundFullResponseDto>(`/rounds/${roundId}`);
    }

    public setJuryToRound(roundId: number, juryId: number): Promise<void> {
        return this.post<void>(`/rounds/${roundId}/juries/${juryId}`);
    }

    public removeJuryFromRound(roundId: number, juryId: number): Promise<void> {
        return this.delete<void>(`/rounds/${roundId}/juries/${juryId}`);
    }

    public autoAssignJuries(roundId: number, k: number): Promise<void> {
        return this.post<void>(`/rounds/${roundId}/auto-assign-juries`, {}, { params: { k } });
    }

    public getLeaderboardForRound(roundId: number, params: LeaderboardQueryParams): Promise<TeamLeaderboardResponseDto[]> {
        return this.get<TeamLeaderboardResponseDto[]>(`/rounds/${roundId}/leaderboard`, { params });
    }

    public getJuriesByRound(roundId: number, params: {query?: string, page: number, size: number}): Promise<PaginationListResponseDto<UserResponseDto>> {
        return this.get<PaginationListResponseDto<UserResponseDto>>(`/rounds/${roundId}/juries`, { params });
    }

    // --- Методи для керування командами в раунді ---

    // PUT: /rounds/{round_id}/assign-teams?team_ids=1,2,3
    public assignTeams(roundId: number, teamIds: number[]): Promise<void> {
        return this.put<void>(`/rounds/${roundId}/assign-teams`, {}, {
            params: { team_ids: teamIds.join(',') }
        });
    }

    // DELETE: /rounds/{round_id}/unassign-teams?team_ids=1,2,3
    public unassignTeams(roundId: number, teamIds: number[]): Promise<void> {
        return this.delete<void>(`/rounds/${roundId}/unassign-teams`, {
            params: { team_ids: teamIds.join(',') }
        });
    }

    // PUT: /rounds/{round_id}/assign-all-teams
    public assignAllTeams(roundId: number): Promise<void> {
        return this.put<void>(`/rounds/${roundId}/assign-all-teams`);
    }

    // DELETE: /rounds/{round_id}/unassign-all-teams
    public unassignAllTeams(roundId: number): Promise<void> {
        return this.delete<void>(`/rounds/${roundId}/unassign-all-teams`);
    }

    // // GET: /rounds/{round_id}/teams
    // public getTeamsInRound(roundId: number, params: TeamSearchParams): Promise<PaginationListResponseDto<TeamListResponseDto>> {
    //     return this.get<PaginationListResponseDto<TeamListResponseDto>>(`/rounds/${roundId}/teams`, { params });
    // }

    // GET: /rounds/{round_id}/not-teams (Команди турніру, яких немає в цьому раунді)
    public getTeamsNotInRound(roundId: number, params: TeamSearchParams): Promise<PaginationListResponseDto<TeamListResponseDto>> {
        return this.get<PaginationListResponseDto<TeamListResponseDto>>(`/rounds/${roundId}/not-teams`, { params });
    }
}

export const roundService = new RoundService();