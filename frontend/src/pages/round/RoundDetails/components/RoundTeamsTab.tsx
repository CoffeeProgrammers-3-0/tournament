import {
    Box,
    Button,
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
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import FastForwardIcon from "@mui/icons-material/FastForward";
import type {TeamLeaderboardResponseDto} from "../../../../entities/team/team.dto";
import type {RoundFullResponseDto} from "../../../../entities/round/round.dto";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {ErrorMessages} from "../../../../components/main/ErrorMessages.tsx"; // Додайте імпорт

type Props = {
    tabValue: number;
    leaderboard: TeamLeaderboardResponseDto[];
    loadingTab: boolean;
    roundData: RoundFullResponseDto;
    onOpenStats: (teamId: number, e: React.MouseEvent) => void;
    navigate: (path: string) => void;
    t: (key: string, options?: any) => string;
    isAdmin: boolean;
    onOpenAddMissingTeamsModal: () => void;
    onOpenAdvanceTeamsModal: () => void;
    onUnassignTeam: (teamId: number) => void;
    onExportLeaderboard: () => void;
    isExporting: boolean;
    errors: string[];
};

export const RoundTeamsTab = ({
                                  tabValue, leaderboard, loadingTab, roundData, onOpenStats, navigate, t,
                                  isAdmin, onOpenAddMissingTeamsModal, onOpenAdvanceTeamsModal, onUnassignTeam, onExportLeaderboard, isExporting, errors
                              }: Props) => {
    if (tabValue !== 3) return null;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>
                    {t("round_details.tabs.teams")}
                </Typography>
                <ErrorMessages errors={errors}/>

                <Button
                    variant="outlined"
                    startIcon={isExporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                    onClick={onExportLeaderboard}
                    disabled={isExporting || leaderboard.length === 0}
                >
                    {t("round_details.export_leaderboard")}
                </Button>

                {isAdmin && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<GroupAddIcon/>}
                            onClick={onOpenAddMissingTeamsModal}
                        >
                            Add Missing Teams
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<FastForwardIcon/>}
                            onClick={onOpenAdvanceTeamsModal}
                            disabled={leaderboard.length === 0}
                        >
                            Advance Teams
                        </Button>
                    </Box>
                )}
            </Box>

            {loadingTab ? (
                <CircularProgress sx={{display: "block", mx: "auto", my: 4}}/>
            ) : (
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        border: "1px solid #eee",
                        borderRadius: "16px",
                        maxHeight: "600px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {width: "8px"},
                        "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: "10px" }
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" width="80px" sx={{bgcolor: "grey.50", fontWeight: 700}}>Rank</TableCell>
                                <TableCell sx={{bgcolor: "grey.50", fontWeight: 700}}>Team Name</TableCell>
                                <TableCell sx={{bgcolor: "grey.50", fontWeight: 700}}>Email</TableCell>
                                <TableCell align="right" sx={{bgcolor: "grey.50", fontWeight: 700}}>Points</TableCell>
                                <TableCell align="center" width="100px" sx={{bgcolor: "grey.50", fontWeight: 700}}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboard.map((team, index) => (
                                <TableRow
                                    key={team.id} hover
                                    onClick={() => navigate(`/teams/${team.id}`)}
                                    sx={{
                                        cursor: "pointer",
                                        transition: 'background-color 0.2s',
                                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04) !important' },
                                        // Highlight winners slightly
                                        ...(index < roundData.countOfWinners && { bgcolor: 'rgba(76, 175, 80, 0.02)' })
                                    }}
                                >
                                    <TableCell align="center">
                                        {index === 0 ? <TrophyIcon sx={{color: "gold"}}/> :
                                            index === 1 ? <TrophyIcon sx={{color: "silver"}}/> :
                                                index === 2 ? <TrophyIcon sx={{color: "#cd7f32"}}/> :
                                                    <Typography fontWeight={700} color="text.secondary">{index + 1}</Typography>}
                                    </TableCell>
                                    <TableCell><Typography fontWeight={600}>{team.name}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" color="text.secondary">{team.email}</Typography></TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={team.points}
                                            color={index < roundData.countOfWinners ? "success" : "default"}
                                            variant="filled"
                                            sx={{fontWeight: 700}}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{display: 'flex', gap: 1, justifyContent: 'center'}}>
                                            {isAdmin && (
                                                <Tooltip title="Remove from Round">
                                                    <IconButton color="error" size="small" onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUnassignTeam(team.id);
                                                    }}>
                                                        <PersonRemoveIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="View Stats">
                                                <IconButton color="primary" size="small" onClick={(e) => onOpenStats(team.id, e)} sx={{bgcolor: "primary.50"}}>
                                                    <InsertChartOutlinedIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {leaderboard.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{py: 4, color: 'text.secondary'}}>
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