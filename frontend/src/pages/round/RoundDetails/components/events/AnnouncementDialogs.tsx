import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type {
    RoundEventFullResponseDto,
    RoundEventRequestDto,
    RoundEventType
} from '../../../../../entities/roundEvent/roundEvent.dto';
import type {
    AdminMessageRequestDto,
    RoundAdminMessageResponseDto
} from '../../../../../entities/adminMessage/adminMessage.dto';

const defaultEventData: RoundEventRequestDto = {
    title: '',
    description: '',
    type: 'ONLINE',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    location: '',
    platformUrl: ''
};

export const CreateMessageDialog: React.FC<{
    open: boolean; onClose: () => void; t: any; isLoading?: boolean;
    initialData?: RoundAdminMessageResponseDto | null;
    onSubmit: (data: AdminMessageRequestDto) => Promise<void>;
}> = ({ open, onClose, onSubmit, initialData, isLoading, t }) => {
    const [content, setContent] = useState('');
    useEffect(() => { if (open) setContent(initialData?.content || ''); }, [open, initialData]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {initialData ? `✏️ ${t('announcements.messages.edit_title')}` : `📢 ${t('announcements.messages.create_title')}`}
            </DialogTitle>
            <DialogContent dividers>
                <TextField
                    autoFocus margin="dense" fullWidth multiline rows={5}
                    placeholder={t('announcements.messages.placeholder')}
                    value={content} onChange={(e) => setContent(e.target.value)}
                    disabled={isLoading} sx={{ mt: 1 }}
                />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
                <Button variant="contained" onClick={() => onSubmit({ content })} disabled={isLoading || !content.trim()}>
                    {initialData ? t('common.save') : t('common.post')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const CreateEventDialog: React.FC<{
    open: boolean; onClose: () => void; t: any; isAdmin: boolean; isLoading?: boolean;
    initialData?: RoundEventFullResponseDto | null;
    onSubmit: (data: RoundEventRequestDto) => Promise<void>;
}> = ({ open, onClose, onSubmit, initialData, isLoading, isAdmin, t }) => {
    const [formData, setFormData] = useState<RoundEventRequestDto>(defaultEventData);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (open) {
            setIsEditing(!initialData);
            if (initialData) {
                setFormData({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    type: (initialData.type as RoundEventType) || 'ONLINE',
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : defaultEventData.startDate,
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : defaultEventData.endDate,
                    location: initialData.location || '',
                    platformUrl: initialData.platformUrl || ''
                });
            } else {
                setFormData(defaultEventData);
            }
        }
    }, [open, initialData]);

    const renderField = (label: string, value: string | undefined, name: keyof RoundEventRequestDto, multiline = false) => {
        const stringValue = value || '';
        return (
            <Grid size={{ xs: 12, md: multiline ? 12 : 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
                {isEditing ? (
                    <TextField
                        fullWidth size="small" multiline={multiline} rows={multiline ? 4 : 1}
                        value={stringValue} disabled={isLoading} sx={{ mt: 0.5 }}
                        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                    />
                ) : (
                    <Typography variant="body1" sx={{ fontWeight: 500, minHeight: '24px', whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                        {stringValue || '—'}
                    </Typography>
                )}
            </Grid>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    {isEditing
                        ? (initialData ? t('announcements.events.edit_title') : t('announcements.events.create_title'))
                        : t('announcements.events.view_title')
                    }
                </Box>
                {initialData && isAdmin && !isEditing && (
                    <Button startIcon={<EditIcon />} size="small" onClick={() => setIsEditing(true)}>
                        {t('common.edit')}
                    </Button>
                )}
            </DialogTitle>
            <Divider />
            <DialogContent dividers>
                <Grid container spacing={3}>
                    {renderField(t('announcements.events.label_title'), formData.title, 'title')}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{t('announcements.events.type')}</Typography>
                        {isEditing ? (
                            <TextField select fullWidth size="small" value={formData.type} sx={{ mt: 0.5 }}
                                       onChange={(e) => setFormData({ ...formData, type: e.target.value as RoundEventType })}>
                                <MenuItem value="ONLINE">🌐 Online</MenuItem>
                                <MenuItem value="OFFLINE">📍 Offline</MenuItem>
                            </TextField>
                        ) : (
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {formData.type === 'ONLINE' ? `🌐 Online` : `📍 Offline`}
                            </Typography>
                        )}
                    </Grid>

                    {formData.type === 'ONLINE'
                        ? renderField(t('announcements.events.link'), formData.platformUrl, 'platformUrl')
                        : renderField(t('announcements.events.location'), formData.location, 'location')
                    }

                    {renderField(
                        t('announcements.events.start'),
                        isEditing ? formData.startDate : new Date(formData.startDate).toLocaleString(),
                        'startDate'
                    )}

                    {renderField(
                        t('announcements.events.end'),
                        isEditing ? formData.endDate : (formData.endDate ? new Date(formData.endDate).toLocaleString() : ''),
                        'endDate'
                    )}

                    {renderField(t('announcements.events.desc'), formData.description, 'description', true)}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>{t('common.close')}</Button>
                {isEditing && (
                    <Button variant="contained" onClick={() => onSubmit(formData)} disabled={isLoading || !formData.title.trim()} sx={{ fontWeight: 600 }}>
                        {t('common.save')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};