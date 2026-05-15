import BaseService from '../BaseService';
import type {CalendarEventDto, CalendarFilters} from "../../entities/calendar/calendarEvent.dto.ts";

class CalendarService extends BaseService {
    constructor() {
        super('/calendar');
    }

    public getCalendar(params: CalendarFilters): Promise<CalendarEventDto[]> {
        return this.get<CalendarEventDto[]>('', {
            params
        });
    }
}

export const calendarService = new CalendarService();