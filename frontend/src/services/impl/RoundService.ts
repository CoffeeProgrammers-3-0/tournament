// services/RoundService.ts
import BaseService from '../BaseService';
import type {
    RoundCreateRequestDto,
    RoundFullResponseDto,
    RoundListResponseDto,
    RoundStatus,
    RoundUpdateRequestDto
} from "../../entities/round/round.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

interface RoundQueryParams {
    page: number;
    size: number;
    search?: string;
    status: RoundStatus;
}

class RoundService extends BaseService {
    constructor() {
        super('/api/tournaments');
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
}

export const roundService = new RoundService();