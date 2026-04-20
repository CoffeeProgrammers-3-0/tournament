import {useCallback, useEffect, useState} from "react";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Cookies from "js-cookie";
import {notificationService} from "../services/impl/NotificationService.ts";
import authService from "../services/auth/AuthService.ts";


export const useNotificationSocket = (isLoggedIn: boolean) => {
    const [unseenCount, setUnseenCount] = useState<number>(0);
    const [latestNotification, setLatestNotification] = useState<any>(null);
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
        if (!isLoggedIn) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`),
            reconnectDelay: 5000,
            onConnect: () => {
                // Персональні сповіщення
                if (userId) {
                    client.subscribe(`/topic/notifications/${userId}`, (message) => {
                        const data = JSON.parse(message.body);
                        if (data.countUnseen !== undefined) setUnseenCount(data.countUnseen);
                        if (data.content) setLatestNotification({ ...data.content, isGlobal: false });
                    });
                }

                // Глобальні повідомлення від адміна
                client.subscribe(`/topic/global_messages`, (message) => {
                    const data = JSON.parse(message.body);
                    setLatestNotification({
                        id: data.id || Date.now(),
                        content: data.content || data.message,
                        isGlobal: true,
                        date: new Date().toISOString(),
                        key: 'notifications.global.admin_message'
                    });
                });
            },


            onStompError: async (frame) => {
                console.error('WS Error:', frame.headers['message']);

                if (!isLoggedIn) return;

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
                        client.activate(); // Перепідключаємось з новим токеном
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