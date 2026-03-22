import BaseService from "../BaseService.ts";
import type {
    TeamCreateRequestDto,
    TeamFullResponseDto,
    TeamLeaderboardResponseDto,
    TeamListResponseDto,
    TeamUpdateRequestDto,
    StatisticResponseDto,
} from "../../entities/team/team.dto.ts";
import type { UserCreateRequestForTeamDto } from "../../entities/user/user.dto.ts";

class TeamService extends BaseService {
    constructor() {
        super("/teams");
    }

    // GET /api/teams/my — teams where current user is a member
    getMy(): Promise<TeamListResponseDto[]> {
        return this.get("/my");
    }

    // GET /api/teams/{id}
    getById(id: number): Promise<TeamFullResponseDto> {
        return this.get(`/${id}`);
    }

    // GET /api/teams/{id}/tournaments — tournaments this team participated in
    getTournaments(id: number): Promise<TeamListResponseDto[]> {
        return this.get(`/${id}/tournaments`);
    }

    // POST /api/teams/tournament/{tournamentId} — create team and register for tournament
    create(tournamentId: number, data: TeamCreateRequestDto): Promise<TeamFullResponseDto> {
        return this.post(`/tournament/${tournamentId}`, data);
    }

    // PUT /api/teams/{id}
    update(id: number, data: TeamUpdateRequestDto): Promise<TeamFullResponseDto> {
        return this.put(`/${id}`, data);
    }

    // POST /api/teams/{id}/members — add member to team
    addMember(id: number, data: UserCreateRequestForTeamDto): Promise<TeamFullResponseDto> {
        return this.post(`/${id}/members`, data);
    }

    // DELETE /api/teams/{id}/members/{userId}
    removeMember(id: number, userId: number): Promise<void> {
        return this.delete(`/${id}/members/${userId}`);
    }

    // PATCH /api/teams/{id}/members/{userId}/leader — promote member to leader
    promoteToLeader(id: number, userId: number): Promise<void> {
        return this.patch(`/${id}/members/${userId}/leader`);
    }

    // GET /api/teams/round/{roundId}/leaderboard
    getLeaderboard(roundId: number): Promise<TeamLeaderboardResponseDto[]> {
        return this.get(`/round/${roundId}/leaderboard`);
    }

    // GET /api/teams/{id}/round/{roundId}/statistics
    getStatistics(id: number, roundId: number): Promise<StatisticResponseDto> {
        return this.get(`/${id}/round/${roundId}/statistics`);
    }
}

export default new TeamService();
