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
import {HtmlContent} from "./constants.ts";
import {formatDisplay} from "../../../../../utils/data.ts";
import {useTranslation} from 'react-i18next';

interface Props {
    eventsData: PaginationListResponseDto<RoundEventListResponseDto> | null;
    messagesData: PaginationListResponseDto<RoundAdminMessageResponseDto> | null;
    loadingTab: boolean;
    isAdmin: boolean;
    eventsPage: number;
    messagesPage: number;
    onEventsPageChange: (page: number) => void;
    onMessagesPageChange: (page: number) => void;
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
    const { i18n } = useTranslation();

    if (loadingTab) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

    return (
        <Grid container spacing={4} sx={{ mt: 1 }}>
            {/* ANNOUNCEMENTS */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}><CampaignIcon /></Avatar>
                            {t('announcements.messages.title')}
                        </Typography>
                        {isAdmin && (
                            <Button variant="contained" startIcon={<CampaignIcon />} onClick={onOpenCreateMessage} sx={{ borderRadius: 2 }}>
                                {t('common.add')}
                            </Button>
                        )}
                    </Box>

                    {!messagesData?.content?.length ? (
                        <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed grey', bgcolor: 'transparent' }}>
                            <Typography color="text.secondary">{t('announcements.messages.empty')}</Typography>
                        </Paper>
                    ) : (
                        messagesData.content.map((msg) => (
                            <Card key={msg.id} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.light' }}>
                                            {msg.creator?.fullName?.[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{msg.creator?.fullName}</Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                {formatDisplay(msg.date, i18n.language)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <HtmlContent dangerouslySetInnerHTML={{ __html: msg.content }} />
                                    {isAdmin && (
                                        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, right: 8 }}>
                                            <IconButton size="small" onClick={() => onEditMessage(msg)}><EditIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => onDeleteMessage(msg.id)}><DeleteIcon fontSize="small" /></IconButton>
                                        </Stack>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                    {messagesData && messagesData.totalPages > 1 && (
                        <Pagination count={messagesData.totalPages} page={messagesPage} onChange={(_, p) => onMessagesPageChange(p)} sx={{ alignSelf: 'center' }} />
                    )}
                </Stack>
            </Grid>

            {/* SCHEDULE */}
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

                    {!eventsData?.content?.length ? (
                        <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed grey', bgcolor: 'transparent' }}>
                            <Typography color="text.secondary">{t('announcements.events.empty')}</Typography>
                        </Paper>
                    ) : (
                        <Box sx={{ borderLeft: '2px solid', borderColor: 'divider', ml: 1, pl: 3 }}>
                            {eventsData.content.map((event) => (
                                <Box key={event.id} sx={{ position: 'relative', mb: 3 }}>
                                    <Box sx={{ position: 'absolute', top: 12, left: -33, width: 14, height: 14, borderRadius: '50%', bgcolor: 'background.paper', border: '3px solid', borderColor: 'success.main', zIndex: 2 }} />
                                    <Card sx={{ borderRadius: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 4 } }} onClick={() => onEditEvent(event)}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                                <Chip size="small" label={event.type} color={event.type === 'ONLINE' ? 'info' : 'warning'} sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                                                {isAdmin && (
                                                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Stack>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>{event.title}</Typography>
                                            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" fontWeight={600}>
                                                    {formatDisplay(event.startDate, i18n.language)}
                                                    {event.endDate && ` — ${formatDisplay(event.endDate, i18n.language)}`}
                                                </Typography>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Box>
                            ))}
                        </Box>
                    )}
                    {eventsData && eventsData.totalPages > 1 && (
                        <Pagination count={eventsData.totalPages} page={eventsPage} onChange={(_, p) => onEventsPageChange(p)} sx={{ alignSelf: 'center' }} />
                    )}
                </Stack>
            </Grid>
        </Grid>
    );
};