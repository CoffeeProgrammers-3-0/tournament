import {useEffect, useState} from "react";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Cookies from "js-cookie";
import authService from "../services/auth/AuthService.ts";

export const useNotificationSocket = (isLoggedIn: boolean) => {
    const [unseenCount, setUnseenCount] = useState<number>(0);
    const [latestNotification, setLatestNotification] = useState<any>(null);

    const [refreshToggle, setRefreshToggle] = useState(0);

    const userId = Cookies.get("userId");
    const accessToken = Cookies.get("accessToken");

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`),
            reconnectDelay: 5000,

            connectHeaders: isLoggedIn && accessToken ? {
                Authorization: `Bearer ${accessToken}`
            } : {},

            onConnect: () => {
                console.log("WS Connected. Status: ", isLoggedIn ? "Authorized" : "Guest");

                if (isLoggedIn && userId) {
                    client.subscribe(`/topic/notifications/${userId}`, (message) => {
                        const data = JSON.parse(message.body);
                        if (data.countUnseen !== undefined) setUnseenCount(data.countUnseen);
                        if (data.content) setLatestNotification({ ...data.content, isGlobal: false });
                    });
                }

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
                const errorMessage = frame.headers['message']?.toLowerCase() || '';
                console.error('WS Error:', errorMessage);

                if (isLoggedIn && (errorMessage.includes('is not authenticated') || errorMessage.includes('jwt'))) {
                    await client.deactivate();
                    try {
                        await authService.refresh();
                        setRefreshToggle(prev => prev + 1);
                    } catch (refreshError) {
                        console.error("WS Auth refresh failed", refreshError);
                    }
                }
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [isLoggedIn, userId, accessToken, refreshToggle]);

    return { unseenCount, latestNotification };
};