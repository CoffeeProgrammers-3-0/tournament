import type {RoundListResponseDto} from '../round/round.dto';
import type {TeamListResponseDto} from '../team/team.dto';

export interface SubmissionRequestDto {
    githubLink: string;
    youtubeLink: string;
    description: string;
}

export interface SubmissionFullResponseDto {
    id: number;
    githubLink: string;
    youtubeLink: string;
    description: string;
    round: RoundListResponseDto;
    team: TeamListResponseDto;
}

export interface SubmissionListResponseDto {
    id: number;
    round: RoundListResponseDto;
    team: TeamListResponseDto;
}