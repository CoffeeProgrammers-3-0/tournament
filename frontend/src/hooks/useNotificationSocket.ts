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
    const accessToken = Cookies.get("accessToken"); // Get token for the header

    useEffect(() => {
        // We allow the connection even if not logged in (for global messages)
        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`),
            reconnectDelay: 5000,

            // 1. Send the token only if logged in
            connectHeaders: isLoggedIn && accessToken ? {
                Authorization: `Bearer ${accessToken}`
            } : {},

            onConnect: () => {
                console.log("WS Connected. Status: ", isLoggedIn ? "Authorized" : "Guest");

                // 2. Personal notifications (ONLY if logged in)
                if (isLoggedIn && userId) {
                    client.subscribe(`/topic/notifications/${userId}`, (message) => {
                        const data = JSON.parse(message.body);
                        if (data.countUnseen !== undefined) setUnseenCount(data.countUnseen);
                        if (data.content) setLatestNotification({ ...data.content, isGlobal: false });
                    });
                }

                // 3. Global messages (For everyone)
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

                // If we get an auth error while we think we're logged in, try to refresh
                if (isLoggedIn && (errorMessage.includes('is not authenticated') || errorMessage.includes('jwt'))) {
                    await client.deactivate();
                    try {
                        await authService.refresh();
                        setRefreshToggle(prev => prev + 1);
                        // The effect will re-run because accessToken changes (via state/cookie)
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