import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    Tooltip,
    Typography
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import GavelIcon from "@mui/icons-material/Gavel";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type {UserResponseDto} from "../../../../entities/user/user.dto";

type Props = {
    tabValue: number;
    jury: UserResponseDto[];
    loadingTab: boolean;
    isAdmin: boolean;
    onOpenJuryModal: () => void;
    onRemoveJury: (juryId: number) => void;
    t: (key: string, options?: any) => string;
};

export const RoundJuryTab = ({ tabValue, jury, loadingTab, isAdmin, onOpenJuryModal, onRemoveJury, t }: Props) => {
    if (tabValue !== 2) return null;

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
                <Typography variant="h5" fontWeight={700}>{t("round_details.tabs.jury")}</Typography>
                {isAdmin && (
                    <Button variant="outlined" color="primary" startIcon={<PersonAddAlt1Icon />} onClick={onOpenJuryModal}>
                        {t("round_details.jury.assign")}
                    </Button>
                )}
            </Box>

            {loadingTab ? (
                <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
            ) : (
                <Grid container spacing={2}>
                    {jury.map((j) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={j.id}>
                            <Card sx={{ borderRadius: "16px", border: "1px solid #eee" }} elevation={0}>
                                <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Avatar sx={{ bgcolor: "warning.light", color: "warning.dark" }}><GavelIcon /></Avatar>
                                        <Box>
                                            <Typography variant="body1" fontWeight={700}>{j.fullName}</Typography>
                                            <Typography variant="caption" color="text.secondary">{j.email}</Typography>
                                        </Box>
                                    </Box>
                                    {isAdmin && (
                                        <Tooltip title={t("round_details.jury.remove")}>
                                            <IconButton size="small" color="error" onClick={() => onRemoveJury(j.id)}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};