import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StarIcon from '@mui/icons-material/Star';
import type {StatisticResponseDto} from "../../../../../entities/team/team.dto";
import {ErrorMessages} from "../../../../../components/main/ErrorMessages.tsx";

type Props = {
    open: boolean;
    onClose: () => void;
    selectedStats: StatisticResponseDto | null;
    statsViewMode: "aggregated" | "detailed";
    setStatsViewMode: (mode: "aggregated" | "detailed") => void;
    aggregatedCriteria: {
        criteriaSums: Record<string, { totalPoints: number; totalBonus: number; count: number }>;
        grandTotal: number;
    };
    juryList: string[];
    criteriaList: string[];
    t: (key: string, options?: any) => string;
    errors: string[];
};

export const RoundStatsDialog = ({
                                     open, onClose, selectedStats, statsViewMode, setStatsViewMode,
                                     aggregatedCriteria, juryList, criteriaList, t, errors
                                 }: Props) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            {selectedStats ? (
                <>
                    <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                        <Typography variant="h6" fontWeight={800}>
                            {t("round_details.stats_modal.title", { teamName: selectedStats.name })}
                        </Typography>

                        <ToggleButtonGroup
                            value={statsViewMode}
                            exclusive
                            onChange={(_, newMode) => newMode && setStatsViewMode(newMode)}
                            size="small"
                            color="primary"
                        >
                            <ToggleButton value="aggregated">
                                <ViewListIcon fontSize="small" sx={{ mr: 1 }} />
                                {t("round_details.stats_modal.view_aggregated")}
                            </ToggleButton>
                            <ToggleButton value="detailed">
                                <ViewModuleIcon fontSize="small" sx={{ mr: 1 }} />
                                {t("round_details.stats_modal.view_detailed")}
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </DialogTitle>

                    <DialogContent dividers sx={{ p: 0 }}>
                        <ErrorMessages errors={errors} />
                        <TableContainer>
                            <Table size="medium">
                                <TableHead sx={{ bgcolor: "grey.50" }}>
                                    <TableRow>
                                        <TableCell width="30%"><b>{t("round_details.stats_modal.criteria")}</b></TableCell>

                                        {statsViewMode === "detailed" && juryList.map((jury) => (
                                            <TableCell key={jury} align="center"><b>{jury}</b></TableCell>
                                        ))}

                                        <TableCell align="right" sx={{ bgcolor: "primary.50" }}>
                                            <b>{t("round_details.stats_modal.total")}</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {criteriaList.map((criteria) => {
                                        const aggregated = aggregatedCriteria.criteriaSums[criteria];

                                        return (
                                            <TableRow key={criteria} hover>
                                                <TableCell><Typography fontWeight={600}>{criteria}</Typography></TableCell>

                                                {/* Detailed View Columns */}
                                                {statsViewMode === "detailed" && juryList.map((jury) => {
                                                    const pointData = selectedStats.pointsPerJury?.[jury]?.[criteria];
                                                    const bonus = selectedStats.additionalPointsPerJury?.[jury]?.[criteria] || 0;

                                                    if (!pointData && !bonus) {
                                                        return <TableCell key={jury} align="center" sx={{ color: "text.disabled" }}>-</TableCell>;
                                                    }

                                                    const Content = (
                                                        <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', cursor: pointData?.comment ? 'help' : 'default' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Typography fontWeight={700}>{pointData?.points || 0}</Typography>
                                                                {pointData?.comment && <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                                                            </Box>
                                                            {bonus > 0 && (
                                                                <Typography variant="caption" sx={{ color: 'warning.dark', display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                                                                    <StarIcon sx={{ fontSize: 10, mr: 0.5 }} /> +{bonus}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    );

                                                    return (
                                                        <TableCell key={jury} align="center">
                                                            {pointData?.comment ? (
                                                                <Tooltip title={pointData.comment} arrow placement="top">
                                                                    {Content}
                                                                </Tooltip>
                                                            ) : Content}
                                                        </TableCell>
                                                    );
                                                })}

                                                {/* Aggregated Total Column */}
                                                <TableCell align="right" sx={{ bgcolor: "primary.50" }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                        <Typography fontWeight={800}>{aggregated.totalPoints}</Typography>
                                                        {aggregated.totalBonus > 0 && (
                                                            <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 700 }}>
                                                                +{aggregated.totalBonus} Bonus
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>

                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={statsViewMode === "detailed" ? juryList.length + 1 : 1} align="right">
                                            <Typography fontWeight={800} color="primary" variant="subtitle1">
                                                {t("round_details.stats_modal.total_score")}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ bgcolor: "primary.main", color: "white" }}>
                                            <Typography fontWeight={900} variant="h5">
                                                {aggregatedCriteria.grandTotal}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    </DialogContent>

                    <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Button onClick={onClose} variant="contained" sx={{ borderRadius: '8px' }}>
                            {t("round_details.stats_modal.close")}
                        </Button>
                    </DialogActions>
                </>
            ) :
                <DialogContent>Loading...</DialogContent>
            }
        </Dialog>
    );
};