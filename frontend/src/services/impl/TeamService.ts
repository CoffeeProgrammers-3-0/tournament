import BaseService from '../BaseService';
import type {
    StatisticResponseDto,
    TeamCreateRequestDto,
    TeamFullResponseDto,
    TeamListResponseDto,
    TeamUpdateRequestDto
} from "../../entities/team/team.dto.ts";
import type {UserCreateRequestForTeamDto} from "../../entities/user/user.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

interface TeamQueryParams {
    page: number;
    size: number;
    search?: string;
}

class TeamService extends BaseService {
    constructor() {
        super('/api/teams');
    }

    // --- Core Team Management ---

    public checkIfRegistered(tournamentId: number): Promise<boolean> {
        return this.get<boolean>(`/check/${tournamentId}`);
    }

    public createTeam(tournamentId: number, data: TeamCreateRequestDto): Promise<TeamFullResponseDto> {
        return this.post<TeamFullResponseDto>(`/${tournamentId}`, data);
    }

    public updateTeam(teamId: number, data: TeamUpdateRequestDto): Promise<TeamFullResponseDto> {
        return this.put<TeamFullResponseDto>(`/${teamId}`, data);
    }

    public deleteTeam(teamId: number): Promise<void> {
        return this.delete<void>(`/${teamId}`);
    }

    public getTeamById(teamId: number): Promise<TeamFullResponseDto> {
        return this.get<TeamFullResponseDto>(`/${teamId}`);
    }

    // --- Lists & Filtering ---

    public getAllTeams(params: TeamQueryParams): Promise<PaginationListResponseDto<TeamListResponseDto>> {
        return this.get<PaginationListResponseDto<TeamListResponseDto>>('', { params });
    }

    public getMyTeams(params: TeamQueryParams): Promise<PaginationListResponseDto<TeamListResponseDto>> {
        return this.get<PaginationListResponseDto<TeamListResponseDto>>('/my', { params });
    }

    public getTeamsByTournament(tournamentId: number, params: TeamQueryParams): Promise<PaginationListResponseDto<TeamListResponseDto>> {
        return this.get<PaginationListResponseDto<TeamListResponseDto>>(`/tournament/${tournamentId}`, { params });
    }

    // --- Statistics ---

    public getTeamStats(teamId: number, roundId: number): Promise<StatisticResponseDto> {
        return this.get<StatisticResponseDto>(`/${teamId}/statistics/${roundId}`);
    }

    public getMyTeamStats(roundId: number): Promise<StatisticResponseDto> {
        return this.get<StatisticResponseDto>(`/statistics/${roundId}`);
    }

    // --- Member Management ---

    public addMember(teamId: number, data: UserCreateRequestForTeamDto): Promise<TeamFullResponseDto> {
        return this.post<TeamFullResponseDto>(`/${teamId}/members`, data);
    }

    public removeMember(teamId: number, userId: number): Promise<TeamFullResponseDto> {
        return this.delete<TeamFullResponseDto>(`/${teamId}/members/${userId}`);
    }

    public setTeamLeader(teamId: number, userId: number): Promise<TeamFullResponseDto> {
        return this.patch<TeamFullResponseDto>(`/${teamId}/set-leader/${userId}`);
    }
}

export const teamService = new TeamService();