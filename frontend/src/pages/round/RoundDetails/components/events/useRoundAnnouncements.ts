import {useCallback, useEffect, useState} from 'react';
import {roundEventService} from '../../../../../services/impl/RoundEventService';
import {roundAdminMessageService} from '../../../../../services/impl/RoundAdminMessageService';
import type {
    RoundEventFullResponseDto,
    RoundEventListResponseDto,
    RoundEventRequestDto
} from '../../../../../entities/roundEvent/roundEvent.dto';
import type {
    AdminMessageRequestDto,
    RoundAdminMessageResponseDto
} from '../../../../../entities/adminMessage/adminMessage.dto';

interface SharedActions {
    clearErrors: () => void;
    handleError: (error: any, message: string) => void;
    triggerConfirm: (config: any) => void;
    closeConfirm: () => void;
}

export const useRoundAnnouncements = (
    roundId: number,
    fetchEvents: (page: number) => Promise<void>,
    fetchMessages: (page: number) => Promise<void>,
    t: any,
    shared: SharedActions,
) => {
    const [actionLoading, setActionLoading] = useState(false);

    // Pagination & Modals
    const [eventsPage, setEventsPage] = useState(1);
    const [messagesPage, setMessagesPage] = useState(1);
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [messageModalOpen, setMessageModalOpen] = useState(false);

    // Selection for Edit
    const [selectedEvent, setSelectedEvent] = useState<RoundEventFullResponseDto | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<RoundAdminMessageResponseDto | null>(null);

    // Auto-fetch on page change
    useEffect(() => { fetchEvents(eventsPage - 1); }, [eventsPage, fetchEvents]);
    useEffect(() => { fetchMessages(messagesPage - 1); }, [messagesPage, fetchMessages]);

    const handleOpenEventModal = async (event?: RoundEventListResponseDto) => {
        shared.clearErrors();
        if (event) {
            setActionLoading(true);
            try {
                // Отримуємо повні дані для режиму перегляду
                const fullData = await roundEventService.getEventById(event.id);
                setSelectedEvent(fullData);
            } catch (e) { shared.handleError(e, "Error loading details"); }
            finally { setActionLoading(false); }
        } else {
            setSelectedEvent(null);
        }
        setEventModalOpen(true);
    };

    const handleSaveEvent = useCallback(async (data: RoundEventRequestDto) => {
        shared.clearErrors();
        setActionLoading(true);
        try {
            if (selectedEvent) {
                await roundEventService.updateEvent(selectedEvent.id, data);
            } else {
                await roundEventService.createEvent(roundId, data);
            }
            setEventModalOpen(false);
            await fetchEvents(eventsPage - 1);
        } catch (e) { shared.handleError(e, "Помилка збереження події"); }
        finally { setActionLoading(false); }
    }, [roundId, selectedEvent, eventsPage, fetchEvents, shared]);

    const handleDeleteEvent = useCallback((id: number) => {
        shared.triggerConfirm({
            title: t("round_details.confirm.deleteEvent.title"),
            description: t("round_details.confirm.deleteEvent.description"),
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await roundEventService.deleteEvent(id);
                    await fetchEvents(eventsPage - 1);
                    shared.closeConfirm();
                } catch (e) { shared.handleError(e, "Помилка видалення"); }
            }
        });
    }, [eventsPage, fetchEvents, shared]);

    // --- MESSAGES ---
    const handleOpenMessageModal = (msg?: RoundAdminMessageResponseDto) => {
        shared.clearErrors();
        setSelectedMessage(msg || null);
        setMessageModalOpen(true);
    };

    const handleSaveMessage = useCallback(async (data: AdminMessageRequestDto) => {
        shared.clearErrors();
        setActionLoading(true);
        try {
            if (selectedMessage) {
                await roundAdminMessageService.update(selectedMessage.id, data);
            } else {
                await roundAdminMessageService.create(roundId, data);
            }
            setMessageModalOpen(false);
            await fetchMessages(messagesPage - 1);
        } catch (e) { shared.handleError(e, "Помилка збереження повідомлення"); }
        finally { setActionLoading(false); }
    }, [roundId, selectedMessage, messagesPage, fetchMessages, shared]);

    const handleDeleteMessage = useCallback((id: number) => {
        shared.triggerConfirm({
            title: t("round_details.confirm.deleteMessage.title"),
            description: t("round_details.confirm.deleteMessage.description"),
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await roundAdminMessageService.deleteMessage(id);
                    await fetchMessages(messagesPage - 1);
                    shared.closeConfirm();
                } catch (e) { shared.handleError(e, "Помилка видалення"); }
            }
        });
    }, [messagesPage, fetchMessages, shared]);

    return {
        eventsPage, setEventsPage, messagesPage, setMessagesPage,
        eventModalOpen, setEventModalOpen, messageModalOpen, setMessageModalOpen,
        selectedEvent, selectedMessage, actionLoading,
        handleOpenEventModal, handleSaveEvent, handleDeleteEvent,
        handleOpenMessageModal, handleSaveMessage, handleDeleteMessage
    };
};