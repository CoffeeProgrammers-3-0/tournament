import React, {useCallback, useEffect, useState} from 'react';
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
import CampaignIcon from '@mui/icons-material/Campaign';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {useTranslation} from 'react-i18next';
import Cookies from 'js-cookie';

import {adminMessageService} from '../../services/impl/GlobalAdminMessageService';
import {notificationService} from '../../services/impl/NotificationService';
import {CreateMessageDialog} from '../round/RoundDetails/components/events/AnnouncementDialogs';
import type {AdminMessageRequestDto, GlobalAdminMessageResponseDto} from '../../entities/adminMessage/adminMessage.dto';
import type {NotificationResponseDto} from '../../entities/notification/notification.dto';
import type {PaginationListResponseDto} from '../../entities/wrappers/wrapper.dto';

const PAGE_SIZE = 10;

export const GlobalAnnouncementsPage: React.FC = () => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState<PaginationListResponseDto<GlobalAdminMessageResponseDto> | null>(null);
    const [notifications, setNotifications] = useState<PaginationListResponseDto<NotificationResponseDto> | null>(null);

    const [page, setPage] = useState(1);
    const [msgModalOpen, setMsgModalOpen] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState<GlobalAdminMessageResponseDto | null>(null);

    const isAuthorized = !!Cookies.get('accessToken');
    const isAdmin = Cookies.get('role') === 'ADMIN';

    const fetchData = useCallback(async (currentPage: number, currentTab: number) => {
        setLoading(true);
        try {
            if (currentTab === 0) {
                const data = await adminMessageService.getAll(currentPage - 1, PAGE_SIZE);
                setMessages(data);
            } else if (currentTab === 1 && isAuthorized) {
                const data = await notificationService.getMyNotifications(currentPage - 1, PAGE_SIZE);
                setNotifications(data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthorized]);

    useEffect(() => {
        fetchData(page, tabValue);
    }, [page, tabValue, fetchData]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setPage(1);
    };

    const handleSaveMessage = async (data: AdminMessageRequestDto) => {
        try {
            if (selectedMsg) {
                await adminMessageService.updateMessage(selectedMsg.id, data);
            } else {
                await adminMessageService.create(data);
            }
            setMsgModalOpen(false);
            fetchData(page, tabValue);
        } catch (error) { console.error(error); }
    };

    const handleDeleteMessage = async (id: number) => {
        if (!window.confirm(t('common.confirm_delete'))) return;
        try {
            await adminMessageService.deleteMessage(id);
            fetchData(page, tabValue);
        } catch (error) { console.error(error); }
    };

    const renderSkeletons = () => (
        <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" width="100%" height={100} sx={{ borderRadius: 3 }} />
            ))}
        </Stack>
    );

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 3, textAlign: 'center', color: 'text.primary' }}>
                {t('global.page_title')}
            </Typography>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid', borderColor: 'divider' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab icon={<CampaignIcon />} label={t('global.tabs.announcements')} iconPosition="start" sx={{ fontWeight: 700 }} />
                    <Tab icon={<NotificationsIcon />} label={t('global.tabs.notifications')} iconPosition="start" disabled={!isAuthorized} sx={{ fontWeight: 700 }} />
                </Tabs>
                <Divider />

                <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '400px' }}>
                    {isAdmin && tabValue === 0 && (
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<CampaignIcon />}
                                onClick={() => { setSelectedMsg(null); setMsgModalOpen(true); }}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
                            >
                                {t('announcements.messages.add')}
                            </Button>
                        </Box>
                    )}

                    {loading ? renderSkeletons() : (
                        <Fade in={!loading} timeout={400}>
                            <Box>
                                <Stack spacing={2.5}>
                                    {tabValue === 0 && (
                                        messages?.content.length ? (
                                            messages.content.map((msg) => (
                                                <Card key={msg.id} sx={{ borderRadius: 3, position: 'relative', border: '1px solid', borderColor: 'divider', transition: '0.2s', '&:hover': { boxShadow: 3 } }}>
                                                    <CardContent>
                                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                                            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}>
                                                                {msg.creator?.fullName?.[0] || 'A'}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                                                    {msg.creator?.fullName}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.disabled">
                                                                    {new Date(msg.date).toLocaleString()}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                                            {msg.content}
                                                        </Typography>
                                                        {isAdmin && (
                                                            <Stack direction="row" sx={{ position: 'absolute', top: 8, right: 8 }}>
                                                                <IconButton size="small" onClick={() => { setSelectedMsg(msg); setMsgModalOpen(true); }}>
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton size="small" color="error" onClick={() => handleDeleteMessage(msg.id)}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : <EmptyState text={t('announcements.messages.empty')} />
                                    )}

                                    {tabValue === 1 && (
                                        notifications?.content.length ? (
                                            notifications.content.map((notif) => (
                                                <Card key={notif.id} sx={{
                                                    borderRadius: 3,
                                                    borderLeft: notif.seen ? 'none' : '4px solid',
                                                    borderColor: 'primary.main',
                                                    bgcolor: notif.seen ? 'background.paper' : 'action.hover'
                                                }}>
                                                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                                        <Badge color="primary" variant="dot" invisible={notif.seen}>
                                                            <Avatar sx={{ bgcolor: notif.seen ? 'action.disabledBackground' : 'primary.light' }}>
                                                                <NotificationsIcon fontSize="small" />
                                                            </Avatar>
                                                        </Badge>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: notif.seen ? 400 : 700 }}>
                                                                {t(notif.key)}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.disabled">
                                                                {new Date(notif.date).toLocaleString()}
                                                            </Typography>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : <EmptyState text={t('global.notifications.empty')} />
                                    )}
                                </Stack>

                                {((tabValue === 0 ? messages?.totalPages : notifications?.totalPages) || 0) > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                        <Pagination
                                            count={tabValue === 0 ? messages?.totalPages : notifications?.totalPages}
                                            page={page}
                                            onChange={(_, p) => setPage(p)}
                                            color="primary"
                                        />
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
                onSubmit={handleSaveMessage}
                initialData={selectedMsg}
                t={t}
            />
        </Container>
    );
};

const EmptyState = ({ text }: { text: string }) => (
    <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed', borderColor: 'divider', borderRadius: 4 }}>
        <Typography color="text.disabled" variant="body1">{text}</Typography>
    </Paper>
);