import BaseService from "../BaseService";
import type {
    AdminMessageRequestDto,
    RoundAdminMessageResponseDto
} from "../../entities/adminMessage/adminMessage.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

class RoundAdminMessageService extends BaseService {
    constructor() {
        super("/admin-messages/round");
    }

    public getByRound(roundId: number, page: number, size: number): Promise<PaginationListResponseDto<RoundAdminMessageResponseDto>> {
        return this.get<PaginationListResponseDto<RoundAdminMessageResponseDto>>(`/${roundId}`, {
            params: { page, size }
        });
    }

    public getMyMessages(page: number, size: number): Promise<PaginationListResponseDto<RoundAdminMessageResponseDto>> {
        return this.get<PaginationListResponseDto<RoundAdminMessageResponseDto>>("/my", {
            params: { page, size }
        });
    }

    public create(roundId: number, data: AdminMessageRequestDto): Promise<RoundAdminMessageResponseDto> {
        return this.post<RoundAdminMessageResponseDto>(`/${roundId}`, data);
    }

    public update(id: number, data: AdminMessageRequestDto): Promise<RoundAdminMessageResponseDto> {
        return this.put<RoundAdminMessageResponseDto>(`/${id}`, data);
    }

    public deleteMessage(id: number): Promise<void> {
        return this.delete<void>(`/${id}`);
    }
}

export const roundAdminMessageService = new RoundAdminMessageService();