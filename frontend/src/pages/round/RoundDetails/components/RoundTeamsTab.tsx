import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import TrophyIcon from "@mui/icons-material/EmojiEvents";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import type {TeamLeaderboardResponseDto} from "../../../../entities/team/team.dto";
import type {RoundFullResponseDto} from "../../../../entities/round/round.dto";

type Props = {
    tabValue: number;
    leaderboard: TeamLeaderboardResponseDto[];
    loadingTab: boolean;
    roundData: RoundFullResponseDto;
    onOpenStats: (teamId: number, e: React.MouseEvent) => void;
    navigate: (path: string) => void;
    t: (key: string, options?: any) => string;
};

export const RoundTeamsTab = ({ tabValue, leaderboard, loadingTab, roundData, onOpenStats, navigate, t }: Props) => {
    if (tabValue !== 3) return null;

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                {t("round_details.tabs.teams")}
            </Typography>

            {loadingTab ? (
                <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #eee", borderRadius: "16px" }}>
                    <Table>
                        <TableHead sx={{ bgcolor: "grey.50" }}>
                            <TableRow>
                                <TableCell align="center" width="80px"><b>{t("round_details.teams.rank")}</b></TableCell>
                                <TableCell><b>{t("round_details.teams.team_name")}</b></TableCell>
                                <TableCell><b>{t("round_details.teams.email")}</b></TableCell>
                                <TableCell align="right"><b>{t("round_details.teams.points")}</b></TableCell>
                                <TableCell align="center" width="100px"><b>{t("round_details.common.actions")}</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboard.map((team, index) => (
                                <TableRow key={team.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/teams/${team.id}`)}>
                                    <TableCell align="center">
                                        {index === 0 ? <TrophyIcon sx={{ color: "gold" }} /> :
                                            index === 1 ? <TrophyIcon sx={{ color: "silver" }} /> :
                                                index === 2 ? <TrophyIcon sx={{ color: "#cd7f32" }} /> :
                                                    <Typography fontWeight={700} color="text.secondary">{index + 1}</Typography>}
                                    </TableCell>
                                    <TableCell><Typography fontWeight={600}>{team.name}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" color="text.secondary">{team.email}</Typography></TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={team.points}
                                            color={index < roundData.countOfWinners ? "success" : "default"}
                                            variant="filled"
                                            sx={{ fontWeight: 700 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={t("round_details.stats_modal.open")}>
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={(e) => onOpenStats(team.id, e)}
                                                sx={{ bgcolor: "primary.50" }}
                                            >
                                                <InsertChartOutlinedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {leaderboard.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        {t("round_details.teams.no_data")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};