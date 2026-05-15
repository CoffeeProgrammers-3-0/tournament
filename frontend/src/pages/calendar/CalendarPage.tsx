import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Calendar, dateFnsLocalizer, type Event, type View, Views} from 'react-big-calendar';
import {useNavigate} from 'react-router-dom';
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

import {Box, Chip, Container, LinearProgress, Paper, Typography, useTheme} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
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


const EVENT_COLORS: Record<string, string> = {
    TOURNAMENT_REGISTRATION: '#ed6c02', 
    TOURNAMENT_RUNNING: '#2e7d32',      
    ROUND_ACTIVE: '#0288d1',            
    ROUND_EVENT_OFFLINE: '#9c27b0',     
    ROUND_EVENT_ONLINE: '#00bcd4',      
};

const FILTER_COLOR_MAP: Record<keyof Omit<CalendarFilters, 'start_date' | 'end_date'>, string> = {
    show_reg: EVENT_COLORS.TOURNAMENT_REGISTRATION,
    show_running: EVENT_COLORS.TOURNAMENT_RUNNING,
    show_rounds: EVENT_COLORS.ROUND_ACTIVE,
    show_offline: EVENT_COLORS.ROUND_EVENT_OFFLINE,
    show_online: EVENT_COLORS.ROUND_EVENT_ONLINE,
};

const CalendarPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();

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

    const fetchData = useCallback(async (forcedDate?: Date) => {
        const dateToCheck = forcedDate || currentDate;
        const bufferMonths = 2;
        const rangeStart = subMonths(startOfMonth(dateToCheck), bufferMonths);
        const rangeEnd = addMonths(endOfMonth(dateToCheck), bufferMonths);

        if (loadedRangeRef.current &&
            isWithinInterval(dateToCheck, {
                start: loadedRangeRef.current.start,
                end: loadedRangeRef.current.end
            })) {
            return;
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

    const handleSelectEvent = useCallback((event: MapedCalendarEvent) => {
        switch (event.type) {
            case 'TOURNAMENT_REGISTRATION':
            case 'TOURNAMENT_RUNNING':
                navigate(`/tournaments/${event.id}`);
                break;
            case 'ROUND_ACTIVE':
            case 'ROUND_EVENT_OFFLINE':
            case 'ROUND_EVENT_ONLINE':
                navigate(`/rounds/${event.id}`);
                break;
            default:
                console.warn("Unknown event type for navigation:", event.type);
        }
    }, [navigate]);

    const eventStyleGetter = useCallback((event: MapedCalendarEvent) => {
        const backgroundColor = EVENT_COLORS[event.type] || theme.palette.primary.main;

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.95,
                color: 'white',
                border: 'none',
                display: 'block',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '3px 8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
            }
        };
    }, [theme]);

    const availableViews = useMemo(() => [Views.MONTH, Views.WEEK], []);

    return (
        <Container maxWidth="xl" sx={{ mt: 1, mb: 6 }}>
            {/* Header Area */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box sx={{
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                }}>
                    <CalendarMonthRoundedIcon fontSize="large" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('calendar.title')}
                </Typography>
            </Box>

            {/* Filters Area */}
            <Paper sx={{ p: 2.5, mb: 4, borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t('calendar.filters_label')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {(Object.keys(filters) as Array<keyof typeof filters>).map((key) => {
                        const isActive = filters[key];
                        const chipColor = FILTER_COLOR_MAP[key];

                        return (
                            <Chip
                                key={key}
                                label={t(`calendar.filters.${key}`)}
                                onClick={() => handleFilterToggle(key)}
                                icon={isActive ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                                sx={{
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '0.9rem',
                                    py: 2.5,
                                    px: 1,
                                    borderRadius: '12px',
                                    backgroundColor: isActive ? `${chipColor}15` : 'transparent', 
                                    color: isActive ? chipColor : 'text.secondary',
                                    border: `1.5px solid ${isActive ? chipColor : theme.palette.divider}`,
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        backgroundColor: isActive ? `${chipColor}25` : theme.palette.action.hover,
                                    },
                                    '& .MuiChip-icon': {
                                        color: isActive ? chipColor : 'inherit'
                                    }
                                }}
                                clickable
                            />
                        );
                    })}
                </Box>
            </Paper>

            {/* Calendar Area */}
            <Paper sx={{
                position: 'relative',
                p: { xs: 2, md: 4 },
                height: 'calc(100vh - 300px)',
                minHeight: 700,
                borderRadius: '24px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                overflow: 'hidden',

                
                '& .rbc-calendar': { fontFamily: 'inherit' },
                '& .rbc-toolbar': { mb: 3, gap: 2 },
                '& .rbc-toolbar button': {
                    borderRadius: '10px',
                    padding: '8px 16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    '&:hover': { backgroundColor: 'action.hover', color: 'text.primary' },
                    '&:active, &.rbc-active': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                    }
                },
                '& .rbc-toolbar-label': { fontWeight: 800, fontSize: '1.25rem', color: 'text.primary' },
                '& .rbc-header': { py: 1.5, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', color: 'text.secondary', borderBottom: '2px solid', borderColor: 'divider' },
                '& .rbc-month-view, & .rbc-time-view, & .rbc-agenda-view': { borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' },
                '& .rbc-day-bg + .rbc-day-bg, & .rbc-month-row + .rbc-month-row': { borderColor: 'divider' },
                '& .rbc-today': { backgroundColor: 'primary.50' },
                '& .rbc-event': {
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 10
                    }
                }
            }}>
                {loading && (
                    <LinearProgress
                        sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            borderTopLeftRadius: '24px',
                            borderTopRightRadius: '24px'
                        }}
                    />
                )}
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    culture={i18n.language}
                    eventPropGetter={eventStyleGetter}
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
        </Container>
    );
};

export default CalendarPage;