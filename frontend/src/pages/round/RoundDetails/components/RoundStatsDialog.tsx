import {
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
    Typography,
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import type {StatisticResponseDto} from "../../../../entities/team/team.dto";

type Props = {
    open: boolean;
    onClose: () => void;
    selectedStats: StatisticResponseDto | null;
    statsViewMode: "aggregated" | "detailed";
    setStatsViewMode: (mode: "aggregated" | "detailed") => void;
    aggregatedCriteria: Record<string, { total: number; count: number }>;
    juryList: string[];
    criteriaList: string[];
    t: (key: string, options?: any) => string;
};

export const RoundStatsDialog = ({
                                     open,
                                     onClose,
                                     selectedStats,
                                     statsViewMode,
                                     setStatsViewMode,
                                     aggregatedCriteria,
                                     juryList,
                                     criteriaList,
                                     t,
                                 }: Props) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            {selectedStats && (
                <>
                    <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
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
                        <TableContainer>
                            <Table size="medium">
                                <TableHead sx={{ bgcolor: "grey.50" }}>
                                    <TableRow>
                                        <TableCell><b>{t("round_details.stats_modal.criteria")}</b></TableCell>
                                        {statsViewMode === "detailed" && juryList.map((jury) => (
                                            <TableCell key={jury} align="center"><b>{jury}</b></TableCell>
                                        ))}
                                        <TableCell align="right" sx={{ bgcolor: "primary.50" }}>
                                            <b>{t("round_details.stats_modal.total")}</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {criteriaList.map((criteria) => (
                                        <TableRow key={criteria} hover>
                                            <TableCell><Typography fontWeight={600}>{criteria}</Typography></TableCell>
                                            {statsViewMode === "detailed" && juryList.map((jury) => (
                                                <TableCell key={jury} align="center">
                                                    {selectedStats.pointsPerJury?.[jury]?.[criteria] ?? "-"}
                                                </TableCell>
                                            ))}
                                            <TableCell align="right" sx={{ bgcolor: "primary.50", fontWeight: 700 }}>
                                                {aggregatedCriteria[criteria]?.total ?? 0}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>

                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={statsViewMode === "detailed" ? juryList.length + 1 : 1} align="right">
                                            <Typography fontWeight={800} color="primary">
                                                {t("round_details.stats_modal.total_score")}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ bgcolor: "primary.main", color: "white" }}>
                                            <Typography fontWeight={800} variant="h6">
                                                {Object.values(aggregatedCriteria).reduce((sum, curr) => sum + curr.total, 0)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={onClose} variant="outlined">
                            {t("round_details.stats_modal.close")}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};