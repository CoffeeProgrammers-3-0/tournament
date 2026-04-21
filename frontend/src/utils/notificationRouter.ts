// utils/notificationRouter.ts
import type {NotificationResponseDto} from "../entities/notification/notification.dto";

export const getNotificationLink = (notification: NotificationResponseDto | any): string => {
    if (notification.isGlobal) return '/announcements';

    try {
        const data = JSON.parse(notification.payload || '{}');
        const key = notification.key;

        if (key.includes('.round_event') || key.includes('.round_admin_message')) return `/rounds/${data.roundId}/events`;
        if (key.includes('.round')) return `/rounds/${data.roundId}`;
        if (key.includes('.team_tasks')) return `/teams/${data.teamId}/tasks`;
        if (key.includes('.team')) return `/teams/${data.teamId}`;
        if (key.includes('.jury_submission') || key.includes('.jury')) return `/submissions/${data.submissionId || data.roundId}`;
        if (key.includes('.tournament')) return '/tournament';
        if (key.includes('.points_changed')) return `/teams/${data.teamId}`;

        return '/announcements';
    } catch (e) {
        return '/announcements';
    }
};