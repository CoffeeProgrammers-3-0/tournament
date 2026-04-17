import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
import {Avatar, Box, IconButton, Paper, Slide, type SlideProps, Snackbar, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Cookies from "js-cookie";
import {useTranslation} from "react-i18next";
import {useNotificationSocket} from "../hooks/useNotificationSocket"; // шлях до твого хука

interface NotificationContextType {
    unseenCount: number;
}

// Створюємо контекст з дефолтним значенням
const NotificationContext = createContext<NotificationContextType>({ unseenCount: 0 });

export const useNotification = () => useContext(NotificationContext);

// Анімація виїзду збоку
function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="left" />;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { t } = useTranslation();
    const isLoggedIn = Cookies.get("userId") !== undefined;

    // Підключаємо наш хук тут, на глобальному рівні
    const { unseenCount, latestNotification } = useNotificationSocket(isLoggedIn);

    const [toastOpen, setToastOpen] = useState(false);

    // Слідкуємо за новими сповіщеннями
    useEffect(() => {
        if (latestNotification) {
            setToastOpen(true);
        }
    }, [latestNotification]);

    const handleCloseToast = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setToastOpen(false);
    };

    return (
        <NotificationContext.Provider value={{ unseenCount }}>
            {children}

            {/* ГЛОБАЛЬНИЙ ПОПАП (рендериться поверх усього додатку) */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={6000}
                onClose={handleCloseToast}
                TransitionComponent={SlideTransition}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{ zIndex: 9999 }} // Залізно поверх усього
            >
                <Paper
                    elevation={8}
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        borderRadius: 3,
                        maxWidth: 350,
                        minWidth: 280,
                        backgroundColor: 'background.paper',
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' }
                    }}
                    onClick={handleCloseToast}
                >
                    <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                        <NotificationsActiveIcon color="primary" fontSize="small" />
                    </Avatar>

                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                            {t('header.new_notification', 'Нове сповіщення')}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {/* Перекладаємо ключ, який прийшов з бекенду */}
                            {latestNotification ? t(latestNotification.key) : ''}
                        </Typography>
                    </Box>

                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCloseToast(); }} sx={{ mt: -0.5, mr: -1 }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Paper>
            </Snackbar>
        </NotificationContext.Provider>
    );
};