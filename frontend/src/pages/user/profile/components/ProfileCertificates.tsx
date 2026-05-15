import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Pagination,
    Stack,
    Typography
} from "@mui/material";
import {useTranslation} from "react-i18next";
import {
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Download as DownloadIcon,
    Pending as PendingIcon
} from "@mui/icons-material";
import type {CertificateResponseDto, CertificateStatus} from "../../../../entities/certificate/certificate.dto.ts";

interface ProfileInfoCardProps {
    loadingMy: boolean;
    role: string;
    myCertificates: CertificateResponseDto[];
    downloadCertificate: (certificate: CertificateResponseDto) => void;
    myPage : number;
    setMyPage: (page: number) => void;
    myTotalPages: number
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

export const ProfileCertificates = ({ loadingMy, role, myCertificates, downloadCertificate, myPage, setMyPage, myTotalPages }: ProfileInfoCardProps) => {
    const { t } = useTranslation();

    const canDownloadApproved = (status?: CertificateStatus) => status === 'READY' || role === 'ADMIN';

    return (
        <Card sx={{ borderRadius: "20px", textAlign: "center", p: 2, height: "100%" }}>
            <CardContent>
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
            </CardContent>
        </Card>
    );
};