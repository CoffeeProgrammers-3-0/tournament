import {useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Pagination,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {
    AdminPanelSettings as AdminPanelSettingsIcon,
    AutoAwesome as AutoAwesomeIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    Code as CodeIcon,
    Download as DownloadIcon,
    DragIndicator as DragIndicatorIcon,
    EditNote as EditNoteIcon,
    FileDownload as FileDownloadIcon,
    Pending as PendingIcon,
    Publish as PublishIcon,
    Refresh as RefreshIcon,
    RestartAlt as RestartAltIcon,
    RocketLaunch as RocketLaunchIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';

import {
    type CertificateFieldKey,
    certificateFieldKeys,
    type CertificatesTabKey,
    templateBlocks,
    useRoundCertificatesTab,
    type UseRoundCertificatesTabParams,
} from './useRoundCertificatesTab';
import type {CertificateResponseDto, CertificateStatus} from '../../../../../entities/certificate/certificate.dto.ts';

type RoundCertificatesTabProps = UseRoundCertificatesTabParams;

const fieldTranslationKey: Record<CertificateFieldKey, string> = {
    fullName: 'fullName',
    place: 'place',
    isWinner: 'isWinner',
    points: 'points',
    roundName: 'roundName',
    tournamentName: 'tournamentName',
    teamName: 'teamName',
    certDate: 'certDate',
};

function TabPanel({
                      value,
                      current,
                      children,
                  }: {
    value: CertificatesTabKey;
    current: CertificatesTabKey;
    children: React.ReactNode;
}) {
    if (value !== current) return null;
    return <Box sx={{ pt: 2 }}>{children}</Box>;
}

const statusMeta = (status?: CertificateStatus) => {
    switch (status) {
        case 'READY':
            return { color: 'success' as const, icon: <CheckCircleIcon fontSize="small" /> };
        case 'DRAFT':
            return { color: 'warning' as const, icon: <PendingIcon fontSize="small" /> };
        default:
            return { color: 'default' as const, icon: <BlockIcon fontSize="small" /> };
    }
};

const panelSx = {
    borderRadius: 4,
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,1))',
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';

const API_CONFIG = {
    BASE_URL: API_BASE.replace(/\/api\/?$/, '') // strips /api if present
};

export default function RoundCertificatesTab({ roundId, isAdmin = false }: RoundCertificatesTabProps) {
    const { t } = useTranslation();
    const editorRef = useRef<HTMLTextAreaElement | null>(null);
    const previewFrameRef = useRef<HTMLIFrameElement | null>(null);
    const [templateSearch, setTemplateSearch] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [CertificateResponseDto, setCertificateResponseDto] = useState<CertificateResponseDto | null>(null);

    const {
        activeTab,
        setActiveTab,
        myCertificates,
        createdCertificates,
        templates,
        selectedTemplate,
        myPage,
        setMyPage,
        createdPage,
        setCreatedPage,
        templatesPage,
        setTemplatesPage,
        myTotalPages,
        createdTotalPages,
        templatesTotalPages,
        loadingMy,
        loadingCreated,
        loadingTemplates,
        savingTemplate,
        generating,
        updatingStatus,
        templateName,
        setTemplateName,
        templateDraft,
        setTemplateDraft,
        selectedTemplateId,
        setSelectedTemplateId,
        teamIdsText,
        setTeamIdsText,
        downloadExampleTemplate,
        downloadCurrentTemplateDraft,
        resetTemplateDraft,
        saveTemplateDraft,
        uploadExistingTemplateFile,
        generateForRound,
        generateForSelectedTeams,
        downloadCertificate,
        updateCertificateStatus,
    } = useRoundCertificatesTab({ roundId, isAdmin });

    const canManage = isAdmin;

    const filteredTemplates = useMemo(() => {
        const q = templateSearch.trim().toLowerCase();
        if (!q) return templates;
        return templates.filter((template) => template.name.toLowerCase().includes(q));
    }, [templateSearch, templates]);

    const currentPreview = templateDraft || '';

    const insertAtCursor = (value: string) => {
        const el = editorRef.current;

        if (!el) {
            setTemplateDraft((prev) => `${prev}${value}`);
            return;
        }

        const start = el.selectionStart ?? templateDraft.length;
        const end = el.selectionEnd ?? templateDraft.length;

        setTemplateDraft((prev) => prev.slice(0, start) + value + prev.slice(end));

        requestAnimationFrame(() => {
            el.focus();
            const nextPos = start + value.length;
            el.setSelectionRange(nextPos, nextPos);
        });
    };

    const insertPlaceholder = (fieldKey: CertificateFieldKey) => {
        insertAtCursor(`\${${fieldKey}}`);
    };

    const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();

        const htmlBlock = event.dataTransfer.getData('text/html');
        if (htmlBlock) {
            insertAtCursor(htmlBlock);
            return;
        }

        const fieldKey = event.dataTransfer.getData('text/plain') as CertificateFieldKey;
        if (certificateFieldKeys.includes(fieldKey)) {
            insertPlaceholder(fieldKey);
        }
    };

    const handleTemplateUpload = async (files: FileList | null) => {
        const file = files?.[0];
        if (!file) return;
        await uploadExistingTemplateFile(file, file.name.replace(/\.[^.]+$/, ''));
    };

    const templateOptions = useMemo(
        () => templates.map((template) => ({ id: template.id, label: template.name })),
        [templates],
    );

    const canDownloadApproved = (status?: CertificateStatus) => status === 'READY' || isAdmin;

    const openPreview = (certificate: CertificateResponseDto) => {
        setCertificateResponseDto(certificate);
        setPreviewOpen(true);
    };

    const closePreview = () => {
        setPreviewOpen(false);
        setCertificateResponseDto(null);
    };

    const previewUrl = API_CONFIG.BASE_URL + CertificateResponseDto?.file?.path

    const stats = [
        {
            label: t('certificate.myCertificates', 'My certificates'),
            value: myCertificates.length,
            icon: <AutoAwesomeIcon fontSize="small" />,
        },
        {
            label: t('certificate.templates', 'Templates'),
            value: templates.length,
            icon: <CodeIcon fontSize="small" />,
        },
        {
            label: t('certificate.createdByMe', 'Created by me'),
            value: createdCertificates.length,
            icon: <VisibilityIcon fontSize="small" />,
        },
    ];

    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{
                    ...panelSx,
                    mb: 3,
                    p: { xs: 2, md: 3 },
                    background:
                        'linear-gradient(135deg, rgba(79,70,229,0.10), rgba(16,185,129,0.06), rgba(255,255,255,1))',
                }}
            >
                <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" gap={2}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={1.4}>
                            {t('certificate.tabTitle', 'Certificates')}
                        </Typography>

                        <Typography variant="h4" fontWeight={850} sx={{ mt: 0.5 }}>
                            {t('certificate.tabHeadline', 'Certificate workspace')}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.2, maxWidth: 820, lineHeight: 1.75 }}>
                            {t(
                                'certificate.tabDescription',
                                'Create templates, preview them live, generate certificates for teams, and approve them before users can download.',
                            )}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                            {stats.map((item) => (
                                <Chip
                                    key={item.label}
                                    icon={item.icon}
                                    label={`${item.label}: ${item.value}`}
                                    variant="outlined"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.85)',
                                        fontWeight: 700,
                                        borderRadius: 999,
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }}>
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
                            {t('common:refresh', 'Refresh')}
                        </Button>

                        {canManage && (
                            <Button variant="contained" startIcon={<RocketLaunchIcon />} onClick={() => setActiveTab('generate')}>
                                {t('certificate.generate', 'Generate')}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, value) => setActiveTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: 2,
                        pt: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            minHeight: 56,
                            fontWeight: 750,
                            textTransform: 'none',
                        },
                    }}
                >
                    <Tab value="my" label={t('certificate.myCertificates', 'My certificates')} />
                    {canManage && <Tab value="templates" label={t('certificate.templates', 'Templates')} />}
                    {canManage && <Tab value="generate" label={t('certificate.generate', 'Generate')} />}
                    {canManage && <Tab value="created" label={t('certificate.createdByMe', 'Created by me')} />
                    }
                </Tabs>

                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    <TabPanel value={activeTab} current="my">
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography variant="h6" fontWeight={800}>
                                    {t('certificate.myCertificates', 'My certificates')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('certificate.myCertificatesHint', 'Only approved certificates are visible here.')}
                                </Typography>
                            </Box>

                            {loadingMy ? (
                                <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress />
                                </Box>
                            ) : myCertificates.length === 0 ? (
                                <Alert severity="info">
                                    {t('certificate.noMyCertificates', 'You do not have approved certificates yet.')}
                                </Alert>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            md: 'repeat(2, minmax(0, 1fr))',
                                            xl: 'repeat(3, minmax(0, 1fr))',
                                        },
                                        gap: 2,
                                    }}
                                >
                                    {myCertificates.map((certificate) => {
                                        const c = certificate as CertificateResponseDto;
                                        const meta = statusMeta(c.status);

                                        return (
                                            <Card
                                                key={c.id}
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 4,
                                                    overflow: 'hidden',
                                                    transition: 'transform 160ms ease, box-shadow 160ms ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: 3,
                                                    },
                                                }}
                                            >
                                                <CardContent sx={{ p: 2.5 }}>
                                                    <Stack spacing={1.75}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                                            <Box sx={{ minWidth: 0 }}>
                                                                <Typography fontWeight={800} noWrap>
                                                                    {c.file?.fileRealName ||
                                                                        `${t('certificate.certificate', 'Certificate')} #${c.id}`}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {c.createdAt
                                                                        ? new Date(c.createdAt).toLocaleString()
                                                                        : t('common:unknownDate', 'Unknown date')}
                                                                </Typography>
                                                            </Box>

                                                            {c.status && (
                                                                <Chip
                                                                    size="small"
                                                                    color={meta.color}
                                                                    icon={meta.icon}
                                                                    label={c.status}
                                                                    sx={{ fontWeight: 700 }}
                                                                />
                                                            )}
                                                        </Stack>

                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            startIcon={<DownloadIcon />}
                                                            disabled={!canDownloadApproved(c.status)}
                                                            onClick={() => downloadCertificate(certificate)}
                                                        >
                                                            {t('certificate.download', 'Download')}
                                                        </Button>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </Box>
                            )}

                            <Box display="flex" justifyContent="center" sx={{ pt: 1 }}>
                                <Pagination
                                    page={myPage + 1}
                                    count={Math.max(myTotalPages, 1)}
                                    onChange={(_, page) => setMyPage(page - 1)}
                                    color="primary"
                                />
                            </Box>
                        </Stack>
                    </TabPanel>

                    {canManage && (
                        <TabPanel value={activeTab} current="templates">
                            <Stack spacing={2.5}>
                                <Box
                                    sx={{
                                        p: 2.75,
                                        borderRadius: 4,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        background:
                                            'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(168,85,247,0.05), rgba(255,255,255,1))',
                                    }}
                                >
                                    <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" gap={2}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="h6" fontWeight={850}>
                                                {t('certificate.createTemplate', 'Create template')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 900, lineHeight: 1.75 }}>
                                                {t(
                                                    'certificate.createTemplateHint',
                                                    'Build the certificate visually with blocks and fields, preview it live, then save or download the draft.',
                                                )}
                                            </Typography>
                                        </Box>

                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                                            <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadExampleTemplate}>
                                                {t('certificate.downloadExample', 'Download example')}
                                            </Button>
                                            <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={resetTemplateDraft}>
                                                {t('certificate.resetDraft', 'Reset draft')}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Box>

                                <Card variant="outlined" sx={{ borderRadius: 4 }}>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Stack spacing={2.5}>
                                            <TextField
                                                label={t('certificate.templateName', 'Template name')}
                                                value={templateName}
                                                onChange={(e) => setTemplateName(e.target.value)}
                                                fullWidth
                                                size="small"
                                            />

                                            <Alert severity="info">
                                                {t(
                                                    'certificate.dragHint',
                                                    'Drag a block or a field into the editor. Blocks insert richer HTML sections; fields insert Thymeleaf placeholders such as ${participantName}.',
                                                )}
                                            </Alert>

                                            <Box>
                                                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.25 }}>
                                                    <AutoAwesomeIcon fontSize="small" />
                                                    <Typography variant="subtitle2" fontWeight={800}>
                                                        {t('certificate.blocks', 'Blocks')}
                                                    </Typography>
                                                </Stack>

                                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                                    {templateBlocks.map((block) => (
                                                        <Chip
                                                            key={block.key}
                                                            icon={<DragIndicatorIcon />}
                                                            label={block.label}
                                                            draggable
                                                            onDragStart={(e) => {
                                                                e.dataTransfer.setData('text/html', block.html);
                                                                e.dataTransfer.effectAllowed = 'copy';
                                                            }}
                                                            onClick={() => insertAtCursor(block.html)}
                                                            variant="outlined"
                                                            sx={{ cursor: 'grab', bgcolor: 'background.paper' }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>

                                            <Box>
                                                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.25 }}>
                                                    <CodeIcon fontSize="small" />
                                                    <Typography variant="subtitle2" fontWeight={800}>
                                                        {t('certificate.fields', 'Fields')}
                                                    </Typography>
                                                </Stack>

                                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                                    {certificateFieldKeys.map((fieldKey) => (
                                                        <Chip
                                                            key={fieldKey}
                                                            icon={<DragIndicatorIcon />}
                                                            label={t(`certificate.fields.${fieldTranslationKey[fieldKey]}`, fieldKey)}
                                                            draggable
                                                            onDragStart={(e) => {
                                                                e.dataTransfer.setData('text/plain', fieldKey);
                                                                e.dataTransfer.effectAllowed = 'copy';
                                                            }}
                                                            onClick={() => insertPlaceholder(fieldKey)}
                                                            variant="outlined"
                                                            sx={{ cursor: 'grab', bgcolor: 'background.paper' }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>

                                            <Divider />

                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: {
                                                        xs: '1fr',
                                                        xl: 'minmax(0, 1.12fr) minmax(420px, 0.88fr)',
                                                    },
                                                    gap: 2.5,
                                                    alignItems: 'start',
                                                }}
                                            >
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        height: { xl: 'calc(100vh - 220px)' },
                                                        minHeight: { xs: 520, xl: 720 },
                                                    }}
                                                >
                                                    {/* Header */}
                                                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <EditNoteIcon fontSize="small" />
                                                            <Typography variant="subtitle2" fontWeight={850}>
                                                                {t('certificate.templateBody', 'Template body')}
                                                            </Typography>
                                                        </Stack>

                                                        <Typography variant="caption" color="text.secondary">
                                                            {t(
                                                                'certificate.templateBodyHelper',
                                                                'Write valid HTML and Thymeleaf variables like ${eventTitle}, ${participantName}, ${teamName}.',
                                                            )}
                                                        </Typography>
                                                    </Box>

                                                    {/* Editor */}
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            minHeight: 0,
                                                            p: 1.5,
                                                            display: 'flex',
                                                        }}
                                                        onDrop={handleDrop}
                                                        onDragOver={(e) => e.preventDefault()}
                                                    >
                                                        <TextField
                                                            value={templateDraft}
                                                            onChange={(e) => setTemplateDraft(e.target.value)}
                                                            inputRef={editorRef}
                                                            multiline
                                                            fullWidth
                                                            placeholder="<html>...</html>"
                                                            variant="outlined"
                                                            sx={{
                                                               // height: '100%',

                                                                '& .MuiInputBase-root': {
                                                                    height: '100%',
                                                                    alignItems: 'flex-start',
                                                                    fontFamily:
                                                                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                                                    fontSize: 13,
                                                                    lineHeight: 1.65,
                                                                    borderRadius: 2,
                                                                },

                                                                '& .MuiInputBase-input': {
                                                                    height: '100% !important',
                                                                    overflow: 'auto !important',
                                                                },

                                                                '& textarea': {
                                                                    height: '100% !important',
                                                                    overflow: 'auto !important',
                                                                    padding: 0,
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                </Paper>

                                                <Stack
                                                    spacing={2}
                                                    sx={{
                                                        position: { xl: 'sticky' },
                                                        top: { xl: 16 },
                                                        alignSelf: 'start',
                                                        height: { xl: 'calc(100vh - 220px)' },
                                                        minHeight: { xs: 520, xl: 720 },
                                                    }}
                                                >
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            borderRadius: 3,
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            flex: 1,
                                                            minHeight: 0,
                                                        }}
                                                    >
                                                        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                <VisibilityIcon fontSize="small" />
                                                                <Typography variant="subtitle2" fontWeight={850}>
                                                                    {t('certificate.preview', 'Preview')}
                                                                </Typography>
                                                            </Stack>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {t('certificate.previewHint', 'Live HTML preview of the current draft.')}
                                                            </Typography>
                                                        </Box>

                                                        <Box
                                                            sx={{
                                                                p: 1.25,
                                                                flex: 1,
                                                                minHeight: 0,
                                                                bgcolor: '#f8fafc',
                                                            }}
                                                        >
                                                            <Paper
                                                                elevation={1}
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    borderRadius: 2,
                                                                    overflow: 'hidden',
                                                                    bgcolor: '#fff',
                                                                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                                                                }}
                                                            >
                                                                <Box
                                                                    component="iframe"
                                                                    ref={previewFrameRef}
                                                                    title="certificate-preview"
                                                                    srcDoc={currentPreview}
                                                                    sx={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        minHeight: { xs: 420, xl: '100%' },
                                                                        border: 0,
                                                                        display: 'block',
                                                                        bgcolor: '#fff',
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Box>
                                                    </Paper>

                                                    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                                                        <Stack spacing={1.5}>
                                                            <Typography variant="subtitle2" fontWeight={850}>
                                                                {t('certificate.quickActions', 'Quick actions')}
                                                            </Typography>

                                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                                                <Button
                                                                    fullWidth
                                                                    variant="contained"
                                                                    startIcon={<PublishIcon />}
                                                                    disabled={savingTemplate || !templateName.trim()}
                                                                    onClick={() => saveTemplateDraft()}
                                                                >
                                                                    {savingTemplate
                                                                        ? t('common:saving', 'Saving...')
                                                                        : t('certificate.saveTemplate', 'Save template')}
                                                                </Button>

                                                                <Button
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    startIcon={<FileDownloadIcon />}
                                                                    onClick={downloadCurrentTemplateDraft}
                                                                >
                                                                    {t('certificate.downloadDraft', 'Download draft')}
                                                                </Button>
                                                            </Stack>

                                                            <Button fullWidth variant="outlined" startIcon={<RestartAltIcon />} onClick={resetTemplateDraft}>
                                                                {t('certificate.resetDraft', 'Reset draft')}
                                                            </Button>
                                                        </Stack>
                                                    </Paper>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                <Card variant="outlined" sx={{ borderRadius: 4 }}>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Stack spacing={2}>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                                                <Box>
                                                    <Typography variant="h6" fontWeight={850}>
                                                        {t('certificate.uploadExistingTemplate', 'Upload existing template')}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t(
                                                            'certificate.uploadExistingHint',
                                                            'Upload a ready-made HTML file with Thymeleaf placeholders.',
                                                        )}
                                                    </Typography>
                                                </Box>

                                                <Button variant="outlined" component="label">
                                                    {t('certificate.chooseFile', 'Choose file')}
                                                    <input
                                                        hidden
                                                        type="file"
                                                        accept=".html,.htm,.txt"
                                                        onChange={(e) => handleTemplateUpload(e.target.files)}
                                                    />
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                <Card variant="outlined" sx={{ borderRadius: 4 }}>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Stack spacing={2.25}>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                                                <Box>
                                                    <Typography variant="h6" fontWeight={850}>
                                                        {t('certificate.templates', 'Templates')}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('certificate.templatesHint', 'Search and select a template to generate certificates.')}
                                                    </Typography>
                                                </Box>

                                                <TextField
                                                    size="small"
                                                    value={templateSearch}
                                                    onChange={(e) => setTemplateSearch(e.target.value)}
                                                    placeholder={t('certificate.searchTemplates', 'Search templates')}
                                                    InputProps={{
                                                        startAdornment: <SearchIcon fontSize="small" />,
                                                    }}
                                                    sx={{ width: { xs: '100%', sm: 300 } }}
                                                />
                                            </Stack>

                                            {loadingTemplates ? (
                                                <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                                    <CircularProgress />
                                                </Box>
                                            ) : filteredTemplates.length === 0 ? (
                                                <Alert severity="info">
                                                    {t('certificate.noTemplates', 'No templates available yet.')}
                                                </Alert>
                                            ) : (
                                                <Box
                                                    sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: {
                                                            xs: '1fr',
                                                            md: 'repeat(2, minmax(0, 1fr))',
                                                            xl: 'repeat(3, minmax(0, 1fr))',
                                                        },
                                                        gap: 2,
                                                    }}
                                                >
                                                    {filteredTemplates.map((template) => (
                                                        <Paper
                                                            key={template.id}
                                                            variant={selectedTemplateId === template.id ? 'elevation' : 'outlined'}
                                                            elevation={selectedTemplateId === template.id ? 2 : 0}
                                                            onClick={() => setSelectedTemplateId(template.id)}
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: 3,
                                                                cursor: 'pointer',
                                                                position: 'relative',
                                                                transition: 'transform 160ms ease, box-shadow 160ms ease',
                                                                '&:hover': {
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: 2,
                                                                },
                                                                ...(selectedTemplateId === template.id
                                                                    ? {
                                                                        borderColor: 'primary.main',
                                                                        background:
                                                                            'linear-gradient(180deg, rgba(59,130,246,0.08), rgba(255,255,255,1))',
                                                                    }
                                                                    : {}),
                                                            }}
                                                        >
                                                            <Stack spacing={1.25}>
                                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                                                    <Box sx={{ minWidth: 0 }}>
                                                                        <Typography fontWeight={850} noWrap>
                                                                            {template.name}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary" noWrap>
                                                                            {template.file?.fileRealName || t('certificate.templateFile', 'Template file')}
                                                                        </Typography>
                                                                    </Box>
                                                                    {selectedTemplateId === template.id && (
                                                                        <Chip size="small" color="primary" label={t('common:selected', 'Selected')} />
                                                                    )}
                                                                </Stack>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    #{template.id}
                                                                </Typography>
                                                            </Stack>
                                                        </Paper>
                                                    ))}
                                                </Box>
                                            )}

                                            <Box display="flex" justifyContent="center" sx={{ pt: 1 }}>
                                                <Pagination
                                                    page={templatesPage + 1}
                                                    count={Math.max(templatesTotalPages, 1)}
                                                    onChange={(_, page) => setTemplatesPage(page - 1)}
                                                    color="primary"
                                                />
                                            </Box>

                                            {selectedTemplate && (
                                                <Alert severity="success">
                                                    {t('certificate.selectedTemplate', 'Selected template')}: {selectedTemplate.name}
                                                </Alert>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </TabPanel>
                    )}

                    {canManage && (
                        <TabPanel value={activeTab} current="generate">
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography variant="h6" fontWeight={850}>
                                        {t('certificate.generateCertificates', 'Generate certificates')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t(
                                            'certificate.generateHintShort',
                                            'Choose a template, generate for all teams in the round, or generate only for selected team IDs.',
                                        )}
                                    </Typography>
                                </Box>

                                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                            gap: 2,
                                        }}
                                    >
                                        <TextField
                                            select
                                            label={t('certificate.selectedTemplate', 'Selected template')}
                                            value={selectedTemplateId ?? ''}
                                            onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
                                            fullWidth
                                        >
                                            {templateOptions.map((template) => (
                                                <MenuItem key={template.id} value={template.id}>
                                                    {template.label}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <TextField
                                            label={t('certificate.teamIds', 'Team IDs')}
                                            value={teamIdsText}
                                            onChange={(e) => setTeamIdsText(e.target.value)}
                                            fullWidth
                                            placeholder="1, 2, 3"
                                            helperText={t(
                                                'certificate.teamIdsHelper',
                                                'Comma-separated team IDs. Leave empty and use the round generator for all teams.',
                                            )}
                                        />
                                    </Box>
                                </Paper>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                    <Button
                                        variant="contained"
                                        startIcon={<RocketLaunchIcon />}
                                        disabled={generating || !selectedTemplateId}
                                        onClick={() => generateForRound()}
                                    >
                                        {generating ? t('common:loading', 'Loading...') : t('certificate.generateForRound', 'Generate for round')}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<AdminPanelSettingsIcon />}
                                        disabled={generating || !selectedTemplateId}
                                        onClick={() => generateForSelectedTeams()}
                                    >
                                        {t('certificate.generateForSelectedTeams', 'Generate for selected teams')}
                                    </Button>
                                </Stack>

                                <Alert severity="info">
                                    {t(
                                        'certificate.generateHint',
                                        'The generated certificates will use the selected template and Thymeleaf variables from your backend data.',
                                    )}
                                </Alert>
                            </Stack>
                        </TabPanel>
                    )}

                    {canManage && (
                        <TabPanel value={activeTab} current="created">
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography variant="h6" fontWeight={850}>
                                        {t('certificate.createdByMe', 'Created by me')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t(
                                            'certificate.createdByMeHint',
                                            'Review drafts and approve certificates before users can download them.',
                                        )}
                                    </Typography>
                                </Box>

                                {loadingCreated ? (
                                    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : createdCertificates.length === 0 ? (
                                    <Alert severity="info">
                                        {t('certificate.noCreatedCertificates', 'You have not generated certificates yet.')}
                                    </Alert>
                                ) : (
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: '1fr',
                                                md: 'repeat(2, minmax(0, 1fr))',
                                                xl: 'repeat(3, minmax(0, 1fr))',
                                            },
                                            gap: 2,
                                        }}
                                    >
                                        {createdCertificates.map((certificate) => {
                                            const c = certificate as CertificateResponseDto;
                                            const meta = statusMeta(c.status);

                                            return (
                                                <Card
                                                    key={c.id}
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 4,
                                                        overflow: 'hidden',
                                                        transition: 'transform 160ms ease, box-shadow 160ms ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: 3,
                                                        },
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 2.5 }}>
                                                        <Stack spacing={1.75}>
                                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                                                <Box sx={{ minWidth: 0 }}>
                                                                    <Typography fontWeight={850} noWrap>
                                                                        {c.file?.fileRealName ||
                                                                            `${t('certificate.certificate', 'Certificate')} #${c.id}`}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {c.createdAt
                                                                            ? new Date(c.createdAt).toLocaleString()
                                                                            : t('common:unknownDate', 'Unknown date')}
                                                                    </Typography>
                                                                </Box>

                                                                {c.status && (
                                                                    <Chip
                                                                        size="small"
                                                                        color={meta.color}
                                                                        icon={meta.icon}
                                                                        label={c.status}
                                                                        sx={{ fontWeight: 700 }}
                                                                    />
                                                                )}
                                                            </Stack>

                                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                                <Button
                                                                    variant="outlined"
                                                                    startIcon={<VisibilityIcon />}
                                                                    onClick={() => openPreview(c)}
                                                                >
                                                                    {t('certificate.preview', 'Preview')}
                                                                </Button>

                                                                <Button
                                                                    variant="outlined"
                                                                    startIcon={<DownloadIcon />}
                                                                    disabled={!canDownloadApproved(c.status)}
                                                                    onClick={() => downloadCertificate(certificate)}
                                                                >
                                                                    {t('certificate.download', 'Download')}
                                                                </Button>
                                                            </Stack>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </Box>
                                )}

                                <Box display="flex" justifyContent="center" sx={{ pt: 1 }}>
                                    <Pagination
                                        page={createdPage + 1}
                                        count={Math.max(createdTotalPages, 1)}
                                        onChange={(_, page) => setCreatedPage(page - 1)}
                                        color="primary"
                                    />
                                </Box>
                            </Stack>
                        </TabPanel>
                    )}
                </Box>
            </Paper>

            <Dialog
                open={previewOpen}
                onClose={closePreview}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        pr: 1,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <VisibilityIcon />
                        <Box>
                            <Typography fontWeight={850}>
                                {t('certificate.previewFilledTitle', 'Certificate preview')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {CertificateResponseDto
                                    ? `${CertificateResponseDto.file?.fileRealName || `#${CertificateResponseDto.id}`}`
                                    : ''}
                            </Typography>
                        </Box>
                    </Stack>

                    <Tooltip title={t('common.close', 'Close')}>
                        <IconButton onClick={closePreview}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </DialogTitle>

                <DialogContent dividers sx={{ bgcolor: '#f3f4f6', p: 0 }}>
                    <Box sx={{ p: 2 }}>
                        {previewUrl ? (
                            <Paper
                                elevation={2}
                                sx={{
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    bgcolor: '#fff',
                                }}
                            >
                                <Box
                                    component="iframe"
                                    ref={previewFrameRef}
                                    title="certificate-preview-filled"
                                    src={previewUrl}
                                    sx={{
                                        width: '100%',
                                        height: '75vh',
                                        border: 0,
                                    }}
                                />
                            </Paper>
                        ) : (
                            <Alert severity="info" sx={{ m: 2 }}>
                                {t(
                                    'certificate.noPreviewAvailable',
                                    'No preview URL is available for this certificate. You can still approve or reject it from here.',
                                )}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => CertificateResponseDto && downloadCertificate(CertificateResponseDto as never)}
                            disabled={!canDownloadApproved(CertificateResponseDto?.status)}
                            startIcon={<DownloadIcon />}
                        >
                            {t('certificate.download', 'Download')}
                        </Button>

                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            disabled={!CertificateResponseDto || updatingStatus}
                            onClick={async () => {
                                if (!CertificateResponseDto) return;
                                await updateCertificateStatus(CertificateResponseDto.id, 'READY');
                                closePreview();
                            }}
                        >
                            READY
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            color="warning"
                            disabled={!CertificateResponseDto || updatingStatus}
                            onClick={async () => {
                                if (!CertificateResponseDto) return;
                                await updateCertificateStatus(CertificateResponseDto.id, 'DRAFT');
                                closePreview();
                            }}
                        >
                            DRAFT
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>
        </Box>
    );
}