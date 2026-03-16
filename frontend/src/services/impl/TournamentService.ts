import BaseService from '../BaseService';
import type {
    TournamentCreateRequestDto,
    TournamentFullResponseDto,
    TournamentListResponseDto,
    TournamentStatus,
    TournamentUpdateRequestDto
} from "../../entities/tournament/tournament.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

interface TournamentQueryParams {
    page: number;
    size: number;
    search?: string;
    status?: TournamentStatus;
}

class TournamentService extends BaseService {
    constructor() {
        super('/api/tournaments');
    }

    public createTournament(data: TournamentCreateRequestDto): Promise<TournamentFullResponseDto> {
        return this.post<TournamentFullResponseDto>('', data);
    }

    public updateTournament(tournamentId: number, data: TournamentUpdateRequestDto): Promise<TournamentFullResponseDto> {
        return this.put<TournamentFullResponseDto>(`/${tournamentId}`, data);
    }

    public deleteTournament(tournamentId: number): Promise<void> {
        return this.delete<void>(`/${tournamentId}`);
    }

    public getAllTournaments(params: TournamentQueryParams): Promise<PaginationListResponseDto<TournamentListResponseDto>> {
        return this.get<PaginationListResponseDto<TournamentListResponseDto>>('', { params });
    }

    public getMyTournaments(params: TournamentQueryParams): Promise<PaginationListResponseDto<TournamentListResponseDto>> {
        return this.get<PaginationListResponseDto<TournamentListResponseDto>>('/my', { params });
    }

    public getAvailableTournaments(params: { search?: string, page: number, size: number }): Promise<PaginationListResponseDto<TournamentListResponseDto>> {
        return this.get<PaginationListResponseDto<TournamentListResponseDto>>('/available-for-me', { params });
    }

    public getTournamentById(tournamentId: number): Promise<TournamentFullResponseDto> {
        return this.get<TournamentFullResponseDto>(`/${tournamentId}`);
    }
}

export const tournamentService = new TournamentService();