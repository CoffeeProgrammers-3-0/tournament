import type {TeamListResponseDto} from '../team/team.dto';
import type {RoundListResponseDto} from '../round/round.dto';
import type {UserResponseDto} from '../user/user.dto';

export type TaskType = 'BUG' | 'IMPROVEMENT' | 'FEATURE' | 'OPTIONAL';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export const TASK_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
export const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
export const TASK_TYPES: TaskType[] = ['FEATURE', 'BUG', 'IMPROVEMENT', 'OPTIONAL'];

export interface TeamTaskRequestDto {
    title: string;
    description: string;
    status: TaskStatus;
    type: TaskType;
    priority: TaskPriority;
}

export interface TeamTaskResponseDto {
    id: number;
    team: TeamListResponseDto;
    round: RoundListResponseDto;
    creator: UserResponseDto;
    assignee: UserResponseDto | null;
    title: string;
    description: string;
    status: TaskStatus;
    type: TaskType;
    priority: TaskPriority;
}