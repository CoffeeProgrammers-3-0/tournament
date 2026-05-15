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
        super('/tournaments');
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

    public getAvailableTournaments(params: Omit<TournamentQueryParams, 'status'>): Promise<PaginationListResponseDto<TournamentListResponseDto>> {
        return this.get<PaginationListResponseDto<TournamentListResponseDto>>('/available-for-me', { params });
    }

    public getTournamentById(tournamentId: number): Promise<TournamentFullResponseDto> {
        return this.get<TournamentFullResponseDto>(`/${tournamentId}`);
    }

    public getTournamentByIdAdmin(tournamentId: number): Promise<TournamentFullResponseDto> {
        return this.get<TournamentFullResponseDto>(`/admin/${tournamentId}`);
    }

    public startRegistration(tournamentId: number): Promise<void> {
        return this.get<void>(`/${tournamentId}/start-registration`);
    }

    public startTournament(tournamentId: number): Promise<void> {
        return this.get<void>(`/${tournamentId}/start-tournament`);
    }

    public finishTournament(tournamentId: number): Promise<void> {
        return this.get<void>(`/${tournamentId}/finish-tournament`);
    }

    public rollbackFinishTournament(tournamentId: number): Promise<void> {
        return this.get<void>(`/${tournamentId}/rollback-finish-tournament`);
    }

    public rollbackStartTournament(tournamentId: number): Promise<void> {
        return this.get<void>(`/${tournamentId}/rollback-start-tournament`);
    }

    public setTournamentToDraft(tournamentId: number): Promise<void> {
        return this.get<void>(`/${tournamentId}/draft`);
    }
}

export const tournamentService = new TournamentService();