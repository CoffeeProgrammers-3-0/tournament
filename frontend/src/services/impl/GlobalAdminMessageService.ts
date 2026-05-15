import BaseService from "../BaseService";
import type {
    AdminMessageRequestDto,
    GlobalAdminMessageResponseDto
} from "../../entities/adminMessage/adminMessage.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

class GlobalAdminMessageService extends BaseService {
    constructor() {
        super("/admin-messages/global");
    }

    public getAll(page: number, size: number): Promise<PaginationListResponseDto<GlobalAdminMessageResponseDto>> {
        return this.get<PaginationListResponseDto<GlobalAdminMessageResponseDto>>("", {
            params: { page, size }
        });
    }

    public create(data: AdminMessageRequestDto): Promise<GlobalAdminMessageResponseDto> {
        return this.post<GlobalAdminMessageResponseDto>("", data);
    }

    public updateMessage(id: number, data: AdminMessageRequestDto): Promise<GlobalAdminMessageResponseDto> {
        return this.put<GlobalAdminMessageResponseDto>(`/${id}`, data);
    }

    public deleteMessage(id: number): Promise<void> {
        return this.delete<void>(`/${id}`);
    }
}

export const adminMessageService = new GlobalAdminMessageService();