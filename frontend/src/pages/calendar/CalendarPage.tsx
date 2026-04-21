import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Calendar, dateFnsLocalizer, type Event, type View, Views} from 'react-big-calendar';
import {useNavigate} from 'react-router-dom'; // Додаємо навігацію
import {
    addMonths,
    endOfMonth,
    format,
    getDay,
    isWithinInterval,
    parse,
    startOfMonth,
    startOfWeek,
    subMonths
} from 'date-fns';
import {enUS, uk as ukUA} from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {Box, Chip, Container, Fade, Paper, Typography} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {useTranslation} from 'react-i18next';

import {calendarService} from '../../services/impl/CalendarService';
import type {CalendarEventDto, CalendarEventType, CalendarFilters} from "../../entities/calendar/calendarEvent.dto.ts";

const locales = {
    'en': enUS,
    'uk': ukUA,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface MapedCalendarEvent extends Event {
    id: number;
    type: CalendarEventType;
}

const ensureUtc = (dateStr: string): string => {
    if (!dateStr) return "";
    return (dateStr.includes('Z') || dateStr.includes('+')) ? dateStr : `${dateStr}Z`;
};

const CalendarPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // Зберігаємо межі завантажених даних, щоб не перепитувати сервер
    const loadedRangeRef = useRef<{ start: Date; end: Date } | null>(null);

    const [events, setEvents] = useState<MapedCalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [currentView, setCurrentView] = useState<View>(Views.MONTH);

    const [filters, setFilters] = useState<Omit<CalendarFilters, 'start_date' | 'end_date'>>({
        show_reg: true,
        show_running: true,
        show_rounds: true,
        show_offline: true,
        show_online: true
    });

    // Оптимізована функція отримання даних
    const fetchData = useCallback(async (forcedDate?: Date) => {
        const dateToCheck = forcedDate || currentDate;

        // 1. Визначаємо "буфер": поточний місяць +/- 2 місяці
        const bufferMonths = 2;
        const rangeStart = subMonths(startOfMonth(dateToCheck), bufferMonths);
        const rangeEnd = addMonths(endOfMonth(dateToCheck), bufferMonths);

        // 2. Перевіряємо, чи ми вже завантажили цей період
        if (loadedRangeRef.current &&
            isWithinInterval(dateToCheck, {
                start: loadedRangeRef.current.start,
                end: loadedRangeRef.current.end
            })) {
            return; // Дані вже є в кеші, нічого не робимо
        }

        setLoading(true);
        try {
            const params: CalendarFilters = {
                start_date: rangeStart.toISOString(),
                end_date: rangeEnd.toISOString(),
                ...filters
            };

            const response = await calendarService.getCalendar(params);

            const mapped: MapedCalendarEvent[] = response.map((item: CalendarEventDto) => ({
                id: item.id,
                title: item.name,
                start: new Date(ensureUtc(item.startDate)),
                end: new Date(ensureUtc(item.endDate)),
                type: item.type
            }));

            setEvents(mapped);

            // 3. Оновлюємо кеш
            loadedRangeRef.current = { start: rangeStart, end: rangeEnd };
        } catch (error) {
            console.error("Failed to load calendar events", error);
        } finally {
            setLoading(false);
        }
    }, [filters, currentDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleNavigate = (newDate: Date) => {
        setCurrentDate(newDate);
    };

    const handleFilterToggle = (key: keyof typeof filters) => {
        setFilters(prev => {
            const next = { ...prev, [key]: !prev[key] };
            loadedRangeRef.current = null;
            return next;
        });
    };

    // Логіка кліку на подію
    const handleSelectEvent = useCallback((event: MapedCalendarEvent) => {
        switch (event.type) {
            case 'TOURNAMENT_REGISTRATION':
            case 'TOURNAMENT_RUNNING':
                // Перехід на сторінку турніру за його ID
                navigate(`/tournaments/${event.id}`);
                break;
            case 'ROUND_ACTIVE':
            case 'ROUND_EVENT_OFFLINE':
            case 'ROUND_EVENT_ONLINE':
                // Перехід на сторінку раунду за його ID
                navigate(`/rounds/${event.id}`);
                break;
            default:
                console.warn("Unknown event type for navigation:", event.type);
        }
    }, [navigate]);

    const eventStyleGetter = useCallback((event: MapedCalendarEvent) => {
        let backgroundColor = '#3174ad';

        switch (event.type) {
            case 'TOURNAMENT_REGISTRATION':
                backgroundColor = '#ed6c02';
                break;
            case 'TOURNAMENT_RUNNING':
                backgroundColor = '#2e7d32';
                break;
            case 'ROUND_ACTIVE':
                backgroundColor = '#0288d1';
                break;
            case 'ROUND_EVENT_OFFLINE':
                backgroundColor = '#9c27b0';
                break;
            case 'ROUND_EVENT_ONLINE':
                backgroundColor = '#00bcd4';
                break;
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '2px 6px',
                cursor: 'pointer' // Додаємо вказівник курсору для клікабельності
            }
        };
    }, []);

    const availableViews = useMemo(() => [Views.MONTH, Views.WEEK, Views.AGENDA], []);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary' }}>
                    {t('calendar.title')}
                </Typography>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {t('calendar.filters_label')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {(Object.keys(filters) as Array<keyof typeof filters>).map((key) => {
                        const isActive = filters[key];
                        return (
                            <Chip
                                key={key}
                                label={t(`calendar.filters.${key}`)}
                                onClick={() => handleFilterToggle(key)}
                                color={isActive ? "primary" : "default"}
                                variant={isActive ? "filled" : "outlined"}
                                icon={isActive ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                                sx={{ fontWeight: isActive ? 600 : 400, transition: 'all 0.2s ease' }}
                                clickable
                            />
                        );
                    })}
                </Box>
            </Paper>

            <Fade in={!loading} timeout={400}>
                <Paper sx={{
                    p: 2,
                    height: 'calc(100vh - 280px)',
                    minHeight: 650,
                    borderRadius: 3,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
                }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        culture={i18n.language}
                        eventPropGetter={eventStyleGetter}

                        // Додаємо обробник кліку
                        onSelectEvent={handleSelectEvent}

                        views={availableViews}
                        view={currentView}
                        date={currentDate}
                        onView={(view) => setCurrentView(view)}
                        onNavigate={handleNavigate}

                        style={{ height: '100%' }}
                        messages={{
                            next: t('calendar.next', 'Next'),
                            previous: t('calendar.prev', 'Back'),
                            today: t('calendar.today', 'Today'),
                            month: t('calendar.month', 'Month'),
                            week: t('calendar.week', 'Week'),
                            day: t('calendar.day', 'Day'),
                        }}
                    />
                </Paper>
            </Fade>
        </Container>
    );
};

export default CalendarPage;