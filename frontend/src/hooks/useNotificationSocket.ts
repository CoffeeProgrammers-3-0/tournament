import {useCallback, useEffect, useState} from "react";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Cookies from "js-cookie";
import {notificationService} from "../services/impl/NotificationService.ts";
import type {NotificationResponseDto} from "../entities/notification/notification.dto.ts";
import authService from "../services/auth/AuthService.ts";

interface NotificationWsPayload {
    type: string;
    countUnseen: number;
    content: NotificationResponseDto;
}

export const useNotificationSocket = (isLoggedIn: boolean) => {
    const [unseenCount, setUnseenCount] = useState<number>(0);
    const [latestNotification, setLatestNotification] = useState<NotificationResponseDto | null>(null);
    const userId = Cookies.get("userId");

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
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            // 1. Use beforeConnect to dynamically fetch the token on EVERY attempt
            beforeConnect: () => {
                const token = Cookies.get("accessToken");
                client.connectHeaders = {
                    Authorization: `Bearer ${token}`,
                };
            },

            onConnect: () => {
                console.log(`Connected to /topic/notifications/${userId}`);

                client.subscribe(`/topic/notifications/${userId}`, (message) => {
                    const payload: NotificationWsPayload = JSON.parse(message.body);

                    if (payload.countUnseen !== undefined) {
                        setUnseenCount(payload.countUnseen);
                    }

                    if (payload.content) {
                        setLatestNotification(payload.content);
                    }
                });
            },

            // 2. Intercept the Auth Error and trigger a refresh
            onStompError: async (frame) => {
                console.error('WS Error:', frame.headers['message']);

                const errorMessage = frame.headers['message']?.toLowerCase() || '';
                const isAuthError = errorMessage.includes('access denied') ||
                    errorMessage.includes('expired') ||
                    errorMessage.includes('unauthorized') ||
                    errorMessage.includes('jwt');

                if (isAuthError) {
                    console.warn("WebSocket Auth failed. Attempting to refresh token...");

                    client.deactivate();

                    try {
                        await authService.refresh();

                        client.activate();
                    } catch (refreshError) {
                        console.error("Token refresh failed. User needs to log in again.", refreshError);
                    }
                }
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [isLoggedIn, userId, fetchUnseenCount]);

    return { unseenCount, latestNotification };
};