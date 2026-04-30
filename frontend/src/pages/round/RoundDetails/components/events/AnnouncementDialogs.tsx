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
import ReactQuill from "react-quill-new";
import type {RoundEventRequestDto} from '../../../../../entities/roundEvent/roundEvent.dto';
import {HtmlContent, quillModules} from "./constants";
import {toLocalInput, toUtcIso} from "../../../../../utils/data.ts";
import {ErrorMessages} from "../../../../../components/main/ErrorMessages.tsx";

export const CreateMessageDialog: React.FC<{
    open: boolean; onClose: () => void; t: any; isLoading?: boolean;
    initialData?: any; onSubmit: (data: any) => Promise<void>; errors: string[];
}> = ({ open, onClose, onSubmit, initialData, isLoading, t, errors }) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (open) {
            setContent(initialData?.content || '');
        }
    }, [open, initialData]);

    const handleSubmit = async () => {
        await onSubmit({content});
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 800 }}>
                {initialData?.id ? `✏️ ${t('announcements.messages.edit_title')}` : `📢 ${t('announcements.messages.create_title')}`}
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                {/* 👈 Render errors if they exist. Wrapped in Box for padding since Content has p: 0 */}
                {errors.length > 0 && (
                    <Box sx={{ p: 2, pb: 0 }}>
                        <ErrorMessages errors={errors} />
                    </Box>
                )}

                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    placeholder={t('announcements.messages.placeholder')}
                    style={{ height: '250px', border: 'none', flexGrow: 1 }}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2, mt: 2 }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>{t('common.cancel')}</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit} // 👈 Use the wrapped handler
                    disabled={isLoading || !content.replace(/<(.|\n)*?>/g, '').trim()}
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                    {initialData?.id ? t('common.save') : t('common.post')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const CreateEventDialog: React.FC<{
    open: boolean; onClose: () => void; t: any; isAdmin: boolean; isLoading?: boolean;
    initialData?: any; onSubmit: (data: any) => Promise<void>; errors: string[];
}> = ({ open, onClose, onSubmit, initialData, isLoading, isAdmin, t, errors }) => {
    const [formData, setFormData] = useState<Partial<RoundEventRequestDto>>({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (open) {
            setIsEditing(!initialData);

            if (initialData) {
                setFormData({
                    ...initialData,
                    startDate: toLocalInput(initialData.startDate),
                    endDate: toLocalInput(initialData.endDate)
                });
            } else {
                const now = new Date();
                const inOneHour = new Date(now.getTime() + 3600000);

                setFormData({
                    title: '',
                    description: '',
                    type: 'ONLINE',
                    location: '',
                    platformUrl: '',
                    startDate: toLocalInput(now.toISOString()),
                    endDate: toLocalInput(inOneHour.toISOString())
                });
            }
        }
    }, [open, initialData]);

    const renderField = (label: string, value: any, name: string, type: 'text' | 'datetime' | 'quill' = 'text') => (
        <Grid size={{ xs: 12, md: (type === 'quill' ? 12 : 6) }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            {isEditing ? (
                type === 'quill' ? (
                    <Box sx={{ mt: 1, '& .ql-container': { borderRadius: '0 0 8px 8px' }, '& .ql-toolbar': { borderRadius: '8px 8px 0 0' } }}>
                        <ReactQuill theme="snow" value={value || ''} modules={quillModules} onChange={(val) => setFormData({ ...formData, [name]: val })} />
                    </Box>
                ) : (
                    <TextField
                        fullWidth size="small" type={type === 'datetime' ? 'datetime-local' : 'text'}
                        value={value || ''} disabled={isLoading}
                        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                )
            ) : (
                <Box sx={{ mt: 0.5 }}>
                    {type === 'quill' ? (
                        <HtmlContent dangerouslySetInnerHTML={{ __html: value || '—' }} sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }} />
                    ) : (
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {type === 'datetime' && (value  || '—')}
                        </Typography>
                    )}
                </Box>
            )}
        </Grid>
    );

    const handleSave = async () => {
        const data = { ...formData } as RoundEventRequestDto;
        if (data.type === 'ONLINE') data.location = '';
        else data.platformUrl = '';

        data.startDate = toUtcIso(data.startDate);
        data.endDate = toUtcIso(data.endDate);

        await onSubmit(data);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isEditing ? (initialData ? t('announcements.events.edit_title') : t('announcements.events.create_title')) : t('announcements.events.view_title')}
                {initialData && isAdmin && !isEditing && (
                    <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)} variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                        {t('common.edit')}
                    </Button>
                )}
            </DialogTitle>
            <Divider />
            <DialogContent dividers>
                {/* 👈 Render errors at the top of the modal content */}
                <ErrorMessages errors={errors} />

                <Grid container spacing={3}>
                    {renderField(t('announcements.events.label_title'), formData.title, 'title')}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, mb: 0.5, display: 'block' }}>{t('announcements.events.type')}</Typography>
                        {isEditing ? (
                            <TextField select fullWidth size="small" value={formData.type || 'ONLINE'} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                                <MenuItem value="ONLINE">🌐 Online</MenuItem>
                                <MenuItem value="OFFLINE">📍 Offline</MenuItem>
                            </TextField>
                        ) : (
                            <Typography variant="body1" fontWeight={600}>{formData.type}</Typography>
                        )}
                    </Grid>
                    {renderField(formData.type === 'ONLINE' ? t('announcements.events.link') : t('announcements.events.location'), formData.type === 'ONLINE' ? formData.platformUrl : formData.location, formData.type === 'ONLINE' ? 'platformUrl' : 'location')}
                    {renderField(t('announcements.events.start'), formData.startDate, 'startDate', 'datetime')}
                    {renderField(t('announcements.events.end'), formData.endDate, 'endDate', 'datetime')}
                    {renderField(t('announcements.events.desc'), formData.description, 'description', 'quill')}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>{t('common.close')}</Button>
                {isEditing && (
                    <Button variant="contained" onClick={handleSave} disabled={isLoading || !formData.title?.trim()} sx={{ fontWeight: 700, px: 4, borderRadius: 2 }}>
                        {t('common.save')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};