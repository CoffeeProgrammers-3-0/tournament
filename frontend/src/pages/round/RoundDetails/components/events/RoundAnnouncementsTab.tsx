import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    Pagination,
    Paper,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import type {RoundEventListResponseDto} from '../../../../../entities/roundEvent/roundEvent.dto';
import type {RoundAdminMessageResponseDto} from '../../../../../entities/adminMessage/adminMessage.dto';
import type {PaginationListResponseDto} from '../../../../../entities/wrappers/wrapper.dto';

interface Props {
    eventsData: PaginationListResponseDto<RoundEventListResponseDto> | null;
    messagesData: PaginationListResponseDto<RoundAdminMessageResponseDto> | null;
    loadingTab: boolean;
    isAdmin: boolean;
    // Стейти пагінації (передаються з батьківського компонента/хука)
    eventsPage: number;
    messagesPage: number;
    onEventsPageChange: (page: number) => void;
    onMessagesPageChange: (page: number) => void;
    // Дії
    onOpenCreateEvent: () => void;
    onOpenCreateMessage: () => void;
    onEditEvent: (event: RoundEventListResponseDto) => void;
    onEditMessage: (msg: RoundAdminMessageResponseDto) => void;
    onDeleteEvent: (id: number) => void;
    onDeleteMessage: (id: number) => void;
    t: any;
}

export const RoundAnnouncementsTab: React.FC<Props> = ({
                                                           eventsData, messagesData, loadingTab, isAdmin,
                                                           eventsPage, messagesPage, onEventsPageChange, onMessagesPageChange,
                                                           onOpenCreateEvent, onOpenCreateMessage, onEditEvent, onEditMessage,
                                                           onDeleteEvent, onDeleteMessage, t
                                                       }) => {

    if (loadingTab) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

    return (
        <Grid container spacing={4} sx={{ mt: 1 }}>

            {/* ЛІВА КОЛОНКА: ОГОЛОШЕННЯ */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}><CampaignIcon /></Avatar>
                            {t('announcements.messages.title', 'Оголошення')}
                        </Typography>
                        {isAdmin && (
                            <Button variant="contained" startIcon={<CampaignIcon />} onClick={onOpenCreateMessage} sx={{ borderRadius: 2 }}>
                                {t('announcements.messages.add', 'Створити')}
                            </Button>
                        )}
                    </Box>

                    {(!messagesData?.content || messagesData.content.length === 0) ? (
                        <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed grey', bgcolor: 'transparent' }}>
                            <Typography color="text.secondary">{t('announcements.messages.empty', 'Немає оголошень')}</Typography>
                        </Paper>
                    ) : (
                        <>
                            {messagesData.content.map((msg) => (
                                <Card key={msg.id} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', border: '1px solid', borderColor: 'divider' }}>
                                    <CardContent>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.light' }}>
                                                {msg.creator?.fullName?.[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{msg.creator?.fullName}</Typography>
                                                <Typography variant="caption" color="text.disabled">{new Date(msg.date).toLocaleString()}</Typography>
                                            </Box>
                                        </Stack>

                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                                            {msg.content}
                                        </Typography>

                                        {isAdmin && (
                                            <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 12, right: 12 }}>
                                                <Tooltip title={t('common.edit', 'Редагувати')}>
                                                    <IconButton size="small" onClick={() => onEditMessage(msg)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('common.delete', 'Видалити')}>
                                                    <IconButton size="small" color="error" onClick={() => onDeleteMessage(msg.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Пагінація повідомлень */}
                            {messagesData.totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Pagination
                                        count={messagesData.totalPages}
                                        page={messagesPage}
                                        onChange={(_, page) => onMessagesPageChange(page)}
                                        color="primary"
                                        size="medium"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Stack>
            </Grid>

            {/* ПРАВА КОЛОНКА: РОЗКЛАД */}
            <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'success.main' }}><EventIcon /></Avatar>
                            {t('announcements.events.title')}
                        </Typography>
                        {isAdmin && (
                            <Button variant="outlined" color="success" startIcon={<EventIcon />} onClick={onOpenCreateEvent} sx={{ borderRadius: 2 }}>
                                {t('announcements.events.add')}
                            </Button>
                        )}
                    </Box>

                    {(!eventsData?.content || eventsData.content.length === 0) ? (
                        <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed grey', bgcolor: 'transparent' }}>
                            <Typography color="text.secondary">{t('announcements.events.empty')}</Typography>
                        </Paper>
                    ) : (
                        <>
                            <Box sx={{ borderLeft: '2px solid', borderColor: 'divider', ml: 1, pl: 3 }}>
                                {eventsData.content.map((event) => (
                                    <Box key={event.id} sx={{ position: 'relative', mb: 3 }}>
                                        <Box sx={{
                                            position: 'absolute', top: 12, left: -33, width: 14, height: 14,
                                            borderRadius: '50%', bgcolor: 'background.paper', border: '3px solid', borderColor: 'success.main',
                                            zIndex: 2
                                        }} />

                                        <Card
                                            sx={{
                                                borderRadius: 3,
                                                transition: '0.2s',
                                                cursor: 'pointer',
                                                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
                                            }}
                                            onClick={() => onEditEvent(event)} // Відкриває модалку для ВСІХ
                                        >
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Chip
                                                        size="small"
                                                        label={event.type}
                                                        color={event.type === 'ONLINE' ? 'info' : 'warning'}
                                                        sx={{ mb: 1, fontWeight: 'bold', fontSize: '0.7rem' }}
                                                    />
                                                    {isAdmin && (
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Щоб не відкривалася модалка при видаленні
                                                                onDeleteEvent(event.id);
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Stack>

                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {event.title}
                                                </Typography>

                                                <Stack spacing={0.5}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                                                        <Typography variant="caption">
                                                            {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                ))}
                            </Box>

                            {/* Пагінація подій */}
                            {eventsData.totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                    <Pagination
                                        count={eventsData.totalPages}
                                        page={eventsPage}
                                        onChange={(_, page) => onEventsPageChange(page)}
                                        size="small"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Stack>
            </Grid>
        </Grid>
    );
};