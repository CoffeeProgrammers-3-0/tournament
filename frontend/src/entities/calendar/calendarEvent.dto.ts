export type CalendarEventType = 'TOURNAMENT_REGISTRATION' | 'TOURNAMENT_RUNNING' | 'ROUND_ACTIVE' | 'ROUND_EVENT_OFFLINE' | 'ROUND_EVENT_ONLINE';

export interface CalendarEventDto {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    type: CalendarEventType;
}

export interface CalendarFilters {
    start_date: string;
    end_date: string;
    show_reg?: boolean;
    show_running?: boolean;
    show_rounds?: boolean;
    show_offline?: boolean;
    show_online?: boolean;
}