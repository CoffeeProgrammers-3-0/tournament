import BaseService from "../BaseService";
import type {
    RoundEventFullResponseDto,
    RoundEventListResponseDto,
    RoundEventRequestDto
} from "../../entities/roundEvent/roundEvent.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

class RoundEventService extends BaseService {
    constructor() {
        super("/round-events");
    }

    public getEventsByRound(roundId: number, page: number, size: number): Promise<PaginationListResponseDto<RoundEventListResponseDto>> {
        return this.get<PaginationListResponseDto<RoundEventListResponseDto>>(`/round/${roundId}`, {
            params: { page, size }
        });
    }

    public getEventById(eventId: number): Promise<RoundEventFullResponseDto> {
        return this.get<RoundEventFullResponseDto>(`/${eventId}`);
    }

    public createEvent(roundId: number, data: RoundEventRequestDto): Promise<RoundEventFullResponseDto> {
        return this.post<RoundEventFullResponseDto>(`/${roundId}`, data);
    }

    public updateEvent(id: number, data: RoundEventRequestDto): Promise<RoundEventFullResponseDto> {
        return this.put<RoundEventFullResponseDto>(`/${id}`, data);
    }

    public deleteEvent(id: number): Promise<void> {
        return this.delete<void>(`/${id}`);
    }
}

export const roundEventService = new RoundEventService();