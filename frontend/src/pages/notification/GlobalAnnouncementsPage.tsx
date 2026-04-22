import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Fade,
    IconButton,
    Pagination,
    Paper,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import {
    Campaign as CampaignIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';

import {adminMessageService} from '../../services/impl/GlobalAdminMessageService';
import {notificationService} from '../../services/impl/NotificationService';
import {CreateMessageDialog} from '../round/RoundDetails/components/events/AnnouncementDialogs';
import {formatDisplay} from "../../utils/data";
import {useNotification} from "../../context/NotificationContext.tsx";

import type {GlobalAdminMessageResponseDto} from '../../entities/adminMessage/adminMessage.dto';
import type {NotificationResponseDto} from '../../entities/notification/notification.dto';
import type {PaginationListResponseDto} from '../../entities/wrappers/wrapper.dto';

const PAGE_SIZE = 10;

// --- Мемоізовані під-компоненти ---

const AnnouncementItem = React.memo(({msg, isAdmin, onEdit, onDelete, language, t}: any) => {
    // Safety check to prevent rendering null messages
    if (!msg) return null;

    if (msg.system) {
        // Safe split: handle cases where msg.content might be undefined/null
        const contentStr = msg.content || '';
        const parts = contentStr.split(':').map((p: string) => p.trim());
        const [name, id, key] = parts.length >= 3 ? parts : ['', '', contentStr];

        const parsedMessage = parts.length >= 3
            ? String(t(key, {
                tournamentName: name,
                roundName: name,
                teamName: name,
                id: id
            }))
            : contentStr;

        return (
            <Card sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                transition: '0.2s',
                '&:hover': {boxShadow: 2}
            }}>
                <CardContent sx={{display: 'flex', alignItems: 'center', gap: 2.5}}>
                    <Avatar sx={{bgcolor: 'secondary.light'}}>
                        <CampaignIcon color="secondary" fontSize="small"/>
                    </Avatar>
                    <Box sx={{flex: 1}}>
                        <Typography variant="body2" sx={{fontWeight: 700}}>
                            {parsedMessage}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {formatDisplay(msg.date, language)}
                        </Typography>
                    </Box>
                    {isAdmin && (
                        <Stack direction="row" sx={{ml: 2}}>
                            <IconButton size="small" color="error" onClick={() => onDelete(msg.id)}>
                                <DeleteIcon fontSize="small"/>
                            </IconButton>
                        </Stack>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{
            borderRadius: 3,
            position: 'relative',
            border: '1px solid',
            borderColor: 'divider',
            transition: '0.2s',
            '&:hover': {boxShadow: 3}
        }}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <Avatar sx={{bgcolor: 'primary.main', fontWeight: 'bold'}}>
                        {msg.creator?.fullName?.[0] || 'A'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{fontWeight: 800}}>{msg.creator?.fullName || 'Admin'}</Typography>
                        <Typography variant="caption" color="text.disabled">{formatDisplay(msg.date, language)}</Typography>
                    </Box>
                </Stack>
                <Box
                    sx={{
                        typography: 'body1',
                        lineHeight: 1.6,
                        '& p': {m: 0, mb: 1},
                        '& a': {color: 'primary.main', textDecoration: 'underline'}
                    }}
                    dangerouslySetInnerHTML={{__html: msg.content || ''}}
                />
                {isAdmin && (
                    <Stack direction="row" sx={{position: 'absolute', top: 8, right: 8}}>
                        <IconButton size="small" onClick={() => onEdit(msg)}><EditIcon fontSize="small"/></IconButton>
                        <IconButton size="small" color="error" onClick={() => onDelete(msg.id)}><DeleteIcon
                            fontSize="small"/></IconButton>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
});

const NotificationItem = React.memo(({notif, onClick, t, language}: any) => {
    if (!notif) return null;

    const payloadData = React.useMemo(() => {
        try {
            return JSON.parse(notif.payload || '{}');
        } catch {
            return {};
        }
    }, [notif.payload]);

    return (
        <Card
            onClick={() => onClick(notif)}
            sx={{
                borderRadius: 3, cursor: 'pointer', transition: '0.2s',
                borderLeft: notif.seen ? 'none' : '4px solid',
                borderColor: 'primary.main',
                bgcolor: notif.seen ? 'background.paper' : 'action.hover',
                '&:hover': {transform: 'translateY(-2px)', boxShadow: 2}
            }}
        >
            <CardContent sx={{display: 'flex', alignItems: 'center', gap: 2.5}}>
                <Badge color="primary" variant="dot" invisible={notif.seen}>
                    <Avatar sx={{bgcolor: notif.seen ? 'action.disabledBackground' : 'primary.light'}}>
                        <NotificationsIcon fontSize="small"/>
                    </Avatar>
                </Badge>
                <Box sx={{flex: 1}}>
                    <Typography variant="body2" sx={{fontWeight: notif.seen ? 400 : 700}}>
                        {t(notif.key, payloadData)}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                        {formatDisplay(notif.date, language)}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
});

// --- Головний Компонент ---

export const GlobalAnnouncementsPage: React.FC = () => {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const {latestNotification} = useNotification();

    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [messages, setMessages] = useState<PaginationListResponseDto<GlobalAdminMessageResponseDto> | null>(null);
    const [notifications, setNotifications] = useState<PaginationListResponseDto<NotificationResponseDto> | null>(null);

    const [msgModalOpen, setMsgModalOpen] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState<GlobalAdminMessageResponseDto | null>(null);

    const isAuthorized = !!Cookies.get('accessToken');
    const isAdmin = Cookies.get('role') === 'ADMIN';

    const totalPages = useMemo(() => {
        return tabValue === 0 ? (messages?.totalPages || 0) : (notifications?.totalPages || 0);
    }, [tabValue, messages, notifications]);

    const fetchData = useCallback(async (targetPage: number, targetTab: number) => {
        setLoading(true);
        try {
            if (targetTab === 0) {
                const res = await adminMessageService.getAll(targetPage - 1, PAGE_SIZE);
                setMessages(res);
            } else if (isAuthorized) {
                const res = await notificationService.getMyNotifications(targetPage - 1, PAGE_SIZE);
                setNotifications(res);
            }
        } catch (error) {
            console.error("Fetch failed", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthorized]);

    useEffect(() => {
        fetchData(page, tabValue);
    }, [page, tabValue, fetchData]);

    useEffect(() => {
        if (!latestNotification) return;
        const isGlobal = !!latestNotification.isGlobal;

        if ((tabValue === 0 && isGlobal) || (tabValue === 1 && !isGlobal)) {
            if (page === 1) fetchData(1, tabValue);
        }
    }, [latestNotification, tabValue, page, fetchData]);

    const handleNotificationClick = (notif: NotificationResponseDto) => {
        try {
            const data = JSON.parse(notif.payload || '{}');
            const key = notif.key || '';

            if (key.includes('.round')) navigate(`/rounds/${data.roundId}`);
            else if (key.includes('.team_tasks')) navigate(`/teams/${data.teamId}/tasks`);
            else if (key.includes('.team')) navigate(`/teams/${data.teamId}`);
            else if (key.includes('.jury')) navigate(`/submissions/${data.submissionId}`);
            else if (key.includes('.tournament')) navigate('/tournament');
            else navigate('/announcements');
        } catch {
            navigate('/announcements');
        }
    };

    const handleTabChange = (_: any, newValue: number) => {
        setTabValue(newValue);
        setPage(1);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(t('common.confirm_delete'))) return;
        try {
            await adminMessageService.deleteMessage(id);
            fetchData(page, tabValue);
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return (
        <Container maxWidth="md" sx={{mt: 4, mb: 6}}>
            <Typography variant="h4" sx={{fontWeight: 900, mb: 3, textAlign: 'center'}}>
                {t('global.page_title')}
            </Typography>

            <Paper sx={{borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)'}}>
                <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" textColor="primary"
                      indicatorColor="primary">
                    <Tab icon={<CampaignIcon/>} label={t('global.tabs.announcements')} iconPosition="start"
                         sx={{fontWeight: 700}}/>
                    <Tab icon={<NotificationsIcon/>} label={t('global.tabs.notifications')} iconPosition="start"
                         disabled={!isAuthorized} sx={{fontWeight: 700}}/>
                </Tabs>
                <Divider/>

                <Box sx={{p: {xs: 2, md: 4}, minHeight: 400}}>
                    {isAdmin && tabValue === 0 && (
                        <Box sx={{mb: 3, display: 'flex', justifyContent: 'flex-end'}}>
                            <Button
                                variant="contained"
                                startIcon={<CampaignIcon/>}
                                onClick={() => {
                                    setSelectedMsg(null);
                                    setMsgModalOpen(true);
                                }}
                                sx={{borderRadius: 2, fontWeight: 700}}
                            >
                                {t('announcements.messages.add')}
                            </Button>
                        </Box>
                    )}

                    {loading ? (
                        <Stack spacing={2}>
                            {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100}
                                                          sx={{borderRadius: 3}}/>)}
                        </Stack>
                    ) : (
                        <Fade in={!loading}>
                            <Box>
                                <Stack spacing={2.5}>
                                    {tabValue === 0 ? (
                                        // Fixed: added optional chaining for .length
                                        messages?.content?.length ? (
                                            messages.content.map(msg => (
                                                <AnnouncementItem
                                                    key={msg.id}
                                                    msg={msg}
                                                    isAdmin={isAdmin}
                                                    language={i18n.language}
                                                    onEdit={(m: any) => {
                                                        setSelectedMsg(m);
                                                        setMsgModalOpen(true);
                                                    }}
                                                    t={t}
                                                    onDelete={handleDelete}
                                                />
                                            ))
                                        ) : <EmptyState text={t('announcements.messages.empty')}/>
                                    ) : (
                                        // Fixed: added optional chaining for .length
                                        notifications?.content?.length ? (
                                            notifications.content.map(notif => (
                                                <NotificationItem
                                                    key={notif.id}
                                                    notif={notif}
                                                    t={t}
                                                    language={i18n.language}
                                                    onClick={handleNotificationClick}
                                                />
                                            ))
                                        ) : <EmptyState text={t('global.notifications.empty')}/>
                                    )}
                                </Stack>

                                {totalPages > 1 && (
                                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                                        <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)}
                                                    color="primary"/>
                                    </Box>
                                )}
                            </Box>
                        </Fade>
                    )}
                </Box>
            </Paper>

            <CreateMessageDialog
                open={msgModalOpen}
                onClose={() => setMsgModalOpen(false)}
                onSubmit={async (data) => {
                    try {
                        if (selectedMsg) await adminMessageService.updateMessage(selectedMsg.id, data);
                        else await adminMessageService.create(data);
                        setMsgModalOpen(false);
                        fetchData(page, tabValue);
                    } catch (err) {
                        console.error("Save failed", err);
                    }
                }}
                initialData={selectedMsg}
                t={t}
            />
        </Container>
    );
};

const EmptyState = ({text}: { text: string }) => (
    <Paper sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'transparent',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 4
    }}>
        <Typography color="text.disabled" variant="body1">{text}</Typography>
    </Paper>
);