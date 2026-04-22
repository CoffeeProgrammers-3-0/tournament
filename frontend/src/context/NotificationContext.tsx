import {createContext, type ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {Avatar, Box, Paper, Snackbar, Typography} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CampaignIcon from '@mui/icons-material/Campaign';
import Cookies from "js-cookie";
import {useTranslation} from "react-i18next";
import {useNotificationSocket} from "../hooks/useNotificationSocket";
import {useNavigate} from "react-router-dom";
import {getNotificationLink} from "../utils/notificationRouter.ts";

interface NotificationContextType {
    unseenCount: number;
    latestNotification: any;
    setUnseenCount: (count: number) => void; // <--- Add this
}

const NotificationContext = createContext<NotificationContextType>({
    unseenCount: 0,
    latestNotification: null,
    setUnseenCount: () => {
    } // <--- Default empty function
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({children}: { children: ReactNode }) => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const isLoggedIn = !!Cookies.get("userId");

    // 1. Get the data from the socket hook
    const {unseenCount: socketUnseenCount, latestNotification} = useNotificationSocket(isLoggedIn);

    // 2. Create a local state to manage the count UI
    const [localUnseenCount, setLocalUnseenCount] = useState(0);
    const [toastOpen, setToastOpen] = useState(false);

    // 3. Sync local state whenever the socket sends a new count
    useEffect(() => {
        setLocalUnseenCount(socketUnseenCount);
    }, [socketUnseenCount]);

    useEffect(() => {
        if (latestNotification) setToastOpen(true);
    }, [latestNotification]);

    const handleNotificationClick = () => {
        setToastOpen(false);
        if (latestNotification) {
            setLocalUnseenCount(prev => Math.max(0, prev - 1));
            const link = getNotificationLink(latestNotification);
            navigate(link);
        }
    };

    const payloadData = useMemo(() => {
        if (!latestNotification || latestNotification.isGlobal) return {};
        try {
            return JSON.parse(latestNotification.payload || '{}');
        } catch {
            return {};
        }
    }, [latestNotification]);

    useEffect(() => {
        if (latestNotification) setToastOpen(true);
    }, [latestNotification]);

    const {title, body} = useMemo(() => {
        if (!latestNotification) return {title: '', body: ''};

        const rawContent = String(latestNotification.content || '');

        if (latestNotification.isGlobal) {
            if (latestNotification.system) {
                const parts = rawContent.split(':').map((p: string) => p.trim());
                const [name, id, key] = parts.length >= 3 ? parts : ['', '', rawContent];

                return {
                    title: t(key, {tournamentName: name, roundName: name, teamName: name, id}) as string,
                    body: t('common.click_to_view')
                };
            } else {
                const plainTextBody = rawContent.replace(/<[^>]+>/g, '');

                return {
                    title: t('notifications.global.admin_message') as string,
                    body: plainTextBody.length > 50 ? `${plainTextBody.substring(0, 50)}...` : plainTextBody
                };
            }
        }

        // Personal notification logic
        return {
            title: t(latestNotification.key, payloadData) as string,
            body: t('common.click_to_view') as string
        };
    }, [latestNotification, payloadData, t]);

    return (
        // 5. Pass the local count and the setter to the Provider
        <NotificationContext.Provider value={{
            unseenCount: localUnseenCount,
            latestNotification,
            setUnseenCount: setLocalUnseenCount
        }}>
            {children}
            <Snackbar
                open={toastOpen}
                autoHideDuration={6000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}>
                <Paper
                    onClick={handleNotificationClick}
                    sx={{
                        p: 2, display: 'flex', gap: 2, borderRadius: 3, cursor: 'pointer',
                        borderLeft: '4px solid',
                        borderColor: latestNotification?.isGlobal ? 'secondary.main' : 'primary.main',
                        transition: 'transform 0.2s',
                        '&:hover': {bgcolor: 'action.hover', transform: 'translateY(-2px)'}
                    }}
                >
                    <Avatar sx={{bgcolor: latestNotification?.isGlobal ? 'secondary.light' : 'primary.light'}}>
                        {latestNotification?.isGlobal ? <CampaignIcon color="secondary"/> :
                            <NotificationsActiveIcon color="primary"/>}
                    </Avatar>
                    <Box sx={{flex: 1, minWidth: 200, maxWidth: 300}}>
                        <Typography variant="subtitle2" sx={{fontWeight: 800}}>
                            {title}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                opacity: 0.8,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {body}
                        </Typography>
                    </Box>
                </Paper>
            </Snackbar>
        </NotificationContext.Provider>
    );
};