import BaseService from "../BaseService";
import type {NotificationResponseDto} from "../../entities/notification/notification.dto.ts";
import type {LongDto, PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

class NotificationService extends BaseService {
    constructor() {
        super("/notifications");
    }

    public getMyNotifications(page: number, size: number): Promise<PaginationListResponseDto<NotificationResponseDto>> {
        return this.get<PaginationListResponseDto<NotificationResponseDto>>("/my", {
            params: { page, size }
        });
    }

    public getUnseenCount(): Promise<LongDto> {
        return this.get<LongDto>("/unseen-count");
    }
}

export const notificationService = new NotificationService();