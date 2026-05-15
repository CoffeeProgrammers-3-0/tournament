import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tooltip,
    Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import type {StatisticResponseDto} from "../../../../../entities/team/team.dto";
import {ErrorMessages} from "../../../../../components/main/ErrorMessages.tsx";
import type {BonusRow, PivotRow} from "./useRoundTeamsManager";

type Props = {
    open: boolean;
    onClose: () => void;
    selectedStats: StatisticResponseDto | null;
    statsViewMode: "aggregated" | "detailed";
    setStatsViewMode: (mode: "aggregated" | "detailed") => void;
    grandTotal: number;
    pivotRows: PivotRow[];
    juryList: string[];
    bonusRows: BonusRow[];
    t: (key: string, options?: any) => string;
    errors: string[];
};

export const RoundStatsDialog = ({
                                     open,
                                     onClose,
                                     selectedStats,
                                     statsViewMode,
                                     setStatsViewMode,
                                     grandTotal,
                                     pivotRows,
                                     juryList,
                                     bonusRows,
                                     t,
                                     errors,
                                 }: Props) => {
    const fmt = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(2));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
        >
            {selectedStats ? (
                <>
                    <DialogTitle sx={{ pb: 0, pt: 3, px: 4 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                            <Box>
                                <Typography variant="overline" color="text.secondary" fontWeight={600}>
                                    {t("round_details.stats_modal.title")}
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="primary.main">
                                    {selectedStats.name}
                                </Typography>
                            </Box>

                            <Box textAlign="right">
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                    textTransform="uppercase"
                                >
                                    {t("round_details.stats_modal.total_score")}
                                </Typography>
                                <Typography variant="h4" fontWeight={900} color="secondary.main" sx={{ lineHeight: 1 }}>
                                    {fmt(grandTotal)}
                                </Typography>
                            </Box>
                        </Box>

                        <Tabs
                            value={statsViewMode}
                            onChange={(_, value) => setStatsViewMode(value)}
                            sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}
                        >
                            <Tab
                                icon={<ViewListIcon />}
                                iconPosition="start"
                                label={t("round_details.stats_modal.view_aggregated")}
                                value="aggregated"
                                sx={{ fontWeight: 600, textTransform: "none" }}
                            />
                            <Tab
                                icon={<ViewModuleIcon />}
                                iconPosition="start"
                                label={t("round_details.stats_modal.view_detailed")}
                                value="detailed"
                                sx={{ fontWeight: 600, textTransform: "none" }}
                            />
                        </Tabs>
                    </DialogTitle>

                    <DialogContent dividers sx={{ p: 4, bgcolor: "grey.50", minHeight: 400 }}>
                        <ErrorMessages errors={errors} />

                        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: "grey.100" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, py: 2 }}>
                                            {t("round_details.stats_modal.category_criteria")}
                                        </TableCell>

                                        {statsViewMode === "aggregated" ? (
                                            <TableCell align="right" sx={{ fontWeight: 800 }}>
                                                {t("round_details.stats_modal.weighted_average")}
                                            </TableCell>
                                        ) : (
                                            juryList.map((jury) => (
                                                <TableCell key={jury} align="center" sx={{ fontWeight: 800 }}>
                                                    {jury}
                                                </TableCell>
                                            ))
                                        )}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {pivotRows.map((row) => {
                                        const isCategory = row.type === "category";

                                        return (
                                            <TableRow
                                                key={row.id}
                                                hover
                                                sx={{
                                                    bgcolor: isCategory ? "rgba(0,0,0,0.02)" : "transparent",
                                                }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        fontWeight: isCategory ? 800 : 500,
                                                        pl: row.depth === 1 ? 4 : 2,
                                                        py: isCategory ? 1.5 : 1.2,
                                                    }}
                                                >
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography
                                                            fontWeight={isCategory ? 800 : 500}
                                                            color={isCategory ? "text.primary" : "text.secondary"}
                                                        >
                                                            {row.label}
                                                        </Typography>

                                                        {isCategory && (
                                                            <Chip
                                                                size="small"
                                                                label={`w: ${fmt(row.weight)}`}
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>

                                                {statsViewMode === "aggregated" ? (
                                                    <TableCell align="right">
                                                        <Typography
                                                            fontWeight={isCategory ? 800 : 600}
                                                            color={isCategory ? "primary.main" : "text.primary"}
                                                        >
                                                            {fmt(row.average)}
                                                        </Typography>
                                                    </TableCell>
                                                ) : (
                                                    juryList.map((jury) => {
                                                        const score = row.juryValues[jury] ?? 0;
                                                        const comment = row.type === "criteria" ? row.juryComments?.[jury] || "" : "";

                                                        return (
                                                            <TableCell key={jury} align="center">
                                                                <Box display="flex" flexDirection="column" alignItems="center" gap={0.25}>
                                                                    <Typography
                                                                        fontWeight={isCategory ? 800 : 600}
                                                                        color={isCategory ? "primary.main" : "text.primary"}
                                                                    >
                                                                        {fmt(score)}
                                                                    </Typography>

                                                                    {row.type === "criteria" && comment ? (
                                                                        <Tooltip title={comment}>
                                                                            <Typography
                                                                                variant="caption"
                                                                                sx={{
                                                                                    maxWidth: 150,
                                                                                    whiteSpace: "nowrap",
                                                                                    overflow: "hidden",
                                                                                    textOverflow: "ellipsis",
                                                                                    cursor: "help",
                                                                                    color: "text.secondary",
                                                                                }}
                                                                            >
                                                                                {comment}
                                                                            </Typography>
                                                                        </Tooltip>
                                                                    ) : null}
                                                                </Box>
                                                            </TableCell>
                                                        );
                                                    })
                                                )}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box mt={4}>
                            <Typography variant="h6" mb={2} fontWeight={700}>
                                {t("round_details.stats_modal.bonus_details")}
                            </Typography>

                            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: "grey.100" }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>
                                                {t("round_details.stats_modal.jury")}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>
                                                {t("round_details.stats_modal.points")}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>
                                                {t("round_details.stats_modal.comment")}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bonusRows.length > 0 ? (
                                            bonusRows.map((row) => (
                                                <TableRow key={row.id} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>{row.jury}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<StarIcon />}
                                                            label={`+${row.points}`}
                                                            size="small"
                                                            color="warning"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{row.comment || "-"}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">
                                                    <Typography color="text.secondary" py={2}>
                                                        {t("round_details.stats_modal.no_bonus_points")}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </DialogContent>

                    <DialogActions
                        sx={{
                            p: 3,
                            bgcolor: "background.paper",
                            borderTop: "1px solid",
                            borderColor: "grey.200",
                        }}
                    >
                        <Button
                            onClick={onClose}
                            variant="contained"
                            size="large"
                            sx={{ borderRadius: 2, px: 4, fontWeight: 700, textTransform: "none" }}
                        >
                            {t("round_details.stats_modal.close")}
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <DialogContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 300,
                    }}
                >
                    <CircularProgress size={48} sx={{ mb: 2 }} />
                    <Typography color="text.secondary" fontWeight={600}>
                        {t("round_details.stats_modal.loading")}
                    </Typography>
                </DialogContent>
            )}
        </Dialog>
    );
};