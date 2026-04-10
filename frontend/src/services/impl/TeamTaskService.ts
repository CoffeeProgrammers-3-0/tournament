import BaseService from '../BaseService';
import type {
    TaskPriority,
    TaskStatus,
    TaskType,
    TeamTaskRequestDto,
    TeamTaskResponseDto
} from "../../entities/teamTask/teamTask.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

// Базові параметри для фільтрації та пошуку
interface TaskQueryParams {
    page: number;
    size: number;
    search?: string;
    status?: TaskStatus;
    type?: TaskType;
    priority?: TaskPriority;
}

class TeamTaskService extends BaseService {
    constructor() {
        super('/team-tasks');
    }

    public createTask(roundId: number, data: TeamTaskRequestDto): Promise<TeamTaskResponseDto> {
        return this.post<TeamTaskResponseDto>(`/${roundId}`, data);
    }

    public updateTask(teamTaskId: number, data: TeamTaskRequestDto): Promise<TeamTaskResponseDto> {
        return this.put<TeamTaskResponseDto>(`/${teamTaskId}`, data);
    }

    public deleteTask(teamTaskId: number): Promise<void> {
        return this.delete<void>(`/${teamTaskId}`);
    }

    public updateTaskMeta(
        teamTaskId: number,
        meta: { status?: TaskStatus; priority?: TaskPriority; type?: TaskType }
    ): Promise<TeamTaskResponseDto> {
        return this.patch<TeamTaskResponseDto>(`/${teamTaskId}/update-meta`, null, { params: meta });
    }

    public updateAssignee(teamTaskId: number, assigneeId: number): Promise<TeamTaskResponseDto> {
        return this.patch<TeamTaskResponseDto>(`/${teamTaskId}/assign/${assigneeId}`);
    }

    public getTasksForMyTeamAndRound(
        roundId: number,
        params: TaskQueryParams
    ): Promise<PaginationListResponseDto<TeamTaskResponseDto>> {
        return this.get<PaginationListResponseDto<TeamTaskResponseDto>>(`/round/${roundId}/my`, { params });
    }

    public getMyTasks(params: TaskQueryParams): Promise<PaginationListResponseDto<TeamTaskResponseDto>> {
        return this.get<PaginationListResponseDto<TeamTaskResponseDto>>('/my', { params });
    }
}

export const teamTaskService = new TeamTaskService();