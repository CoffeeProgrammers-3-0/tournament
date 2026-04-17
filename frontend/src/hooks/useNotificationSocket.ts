import {useCallback, useEffect, useState} from "react";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Cookies from "js-cookie";
import {notificationService} from "../services/impl/NotificationService.ts";
import type {NotificationResponseDto} from "../entities/notification/notification.dto.ts";

interface NotificationWsPayload {
    type: string;
    countUnseen: number;
    content: NotificationResponseDto;
}

export const useNotificationSocket = (isLoggedIn: boolean) => {
    const [unseenCount, setUnseenCount] = useState<number>(0);
    const [latestNotification, setLatestNotification] = useState<NotificationResponseDto | null>(null);
    const userId = Cookies.get("userId");

    // Initial fetch
    const fetchUnseenCount = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const response = await notificationService.getUnseenCount();
            setUnseenCount(typeof response === 'object' ? (response as any).value : response);
        } catch (error) {
            console.error("Failed to fetch initial unseen count", error);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn || !userId) return;

        fetchUnseenCount();

        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL || ''}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                console.log(`Connected to /topic/notifications/${userId}`);

                client.subscribe(`/topic/notifications/${userId}`, (message) => {
                    const payload: NotificationWsPayload = JSON.parse(message.body);
                    console.log(message)
                    // Update the count from the WS payload immediately
                    if (payload.countUnseen !== undefined) {
                        setUnseenCount(payload.countUnseen);
                    }

                    if (payload.content) {
                        setLatestNotification(payload.content);
                    }

                    // Optional: You could trigger a toast/snackbar here using payload.content.key
                    console.log("New Notification Received:", payload.content);
                });
            },
            onStompError: (frame) => {
                console.error('WS Error:', frame.headers['message']);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [isLoggedIn, userId, fetchUnseenCount]);

    return { unseenCount, latestNotification };
};