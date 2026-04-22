import {useEffect} from "react";
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
import GroupIcon from "@mui/icons-material/Group";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {Client, type IMessage} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type {TeamLeaderboardResponseDto} from "../../../../../entities/team/team.dto";
import type {RoundFullResponseDto} from "../../../../../entities/round/round.dto";
import {ErrorMessages} from "../../../../../components/main/ErrorMessages.tsx";
import {RoundFormula} from "./RoundFormula.tsx";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";

type Props = {
    leaderboard: TeamLeaderboardResponseDto[];
    setLeaderboard: React.Dispatch<React.SetStateAction<TeamLeaderboardResponseDto[]>>;
    loadingTab: boolean;
    hasMore: boolean;
    isNextPageLoading: boolean;
    onLoadMore: () => void;
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
    onAssignAllTeams: () => void;
    onUnassignAllTeams: () => void;
    myTeamId?: number;
};

type WebSocketPayload = {
    type: 'POINTS_CHANGED' | 'TEAM_DELETED' | 'TEAM_UNASSIGNED_FROM_ROUND' | 'TEAM_ASSIGNED_TO_ROUND';
    content: any[];
};

export const RoundTeamsTab = ({
                                  setLeaderboard, leaderboard, loadingTab, hasMore, isNextPageLoading, onLoadMore,
                                  roundData, onOpenStats, navigate, t, isAdmin, onOpenAddMissingTeamsModal,
                                  onOpenAdvanceTeamsModal, onUnassignTeam, onExportLeaderboard, isExporting, errors,
                                  onAssignAllTeams, onUnassignAllTeams, myTeamId
                              }: Props) => {


    useEffect(() => {
        if (!roundData?.id) return;

        const updateWithWS = (message: IMessage) => {
            const payload: WebSocketPayload = JSON.parse(message.body);
            const { type, content } = payload;

            setLeaderboard((prevLeaderboard) => {
                let updated = [...prevLeaderboard];

                switch (type) {
                    case 'TEAM_ASSIGNED_TO_ROUND': {
                        const newTeams = content.filter(
                            (newTeam: TeamLeaderboardResponseDto) => !prevLeaderboard.some(t => t.id === newTeam.id)
                        );
                        updated = [...prevLeaderboard, ...newTeams];
                        break;
                    }

                    case 'TEAM_UNASSIGNED_FROM_ROUND':
                    case 'TEAM_DELETED': {
                        const idsToRemove = new Set(content.map((item: { id: number }) => item.id));
                        updated = prevLeaderboard.filter(t => !idsToRemove.has(t.id));
                        break;
                    }

                    case 'POINTS_CHANGED': {
                        let newLeaderboard = [...prevLeaderboard];

                        content.forEach((updatedTeam: TeamLeaderboardResponseDto) => {
                            const index = newLeaderboard.findIndex(t => t.id === updatedTeam.id);

                            if (index !== -1) {
                                newLeaderboard[index] = { ...newLeaderboard[index], ...updatedTeam };
                            } else {
                                const lowestVisiblePoints = newLeaderboard.length > 0
                                    ? newLeaderboard[newLeaderboard.length - 1].points
                                    : 0;

                                if (updatedTeam.points > lowestVisiblePoints) {
                                    newLeaderboard.push(updatedTeam);
                                }
                            }
                        });

                        return newLeaderboard
                            .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
                            .slice(0, prevLeaderboard.length > 20 ? prevLeaderboard.length : 20);
                    }

                    default:
                        break;
                }

                return updated
                    .sort((a, b) => b.points - a.points || b.id - a.id)
                    .slice(0, Math.max(prevLeaderboard.length, 10));
            });
        };

        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL || ''}/ws`),
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                console.log(`Connected to WebSocket for Round ${roundData.id}`);

                client.subscribe(`/topic/rounds/${roundData.id}/leaderboard`, (message) => {
                    updateWithWS(message);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [roundData?.id, setLeaderboard]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>
                    {t("round_details.tabs.teams")}
                </Typography>
                <ErrorMessages errors={errors} />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Button
                        variant="outlined"
                        startIcon={isExporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                        onClick={onExportLeaderboard}
                        disabled={isExporting || leaderboard.length === 0}
                    >
                        {t("round_details.export_leaderboard")}
                    </Button>

                    {isAdmin && (
                        <>
                            <Button
                                variant="outlined"
                                color="success"
                                startIcon={<GroupAddIcon />}
                                onClick={onAssignAllTeams}
                            >
                                {t("round_details.teams.assign_all")}
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<GroupRemoveIcon />}
                                onClick={onUnassignAllTeams}
                                disabled={leaderboard.length === 0}
                            >
                                {t("round_details.teams.unassign_all")}
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<GroupAddIcon />}
                                onClick={onOpenAddMissingTeamsModal}
                            >
                                {t("modals.add_teams.title")}
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<FastForwardIcon />}
                                onClick={onOpenAdvanceTeamsModal}
                                disabled={leaderboard.length === 0}
                            >
                                {t("modals.advance_teams.title")}
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            <RoundFormula t={t} />
            {loadingTab ? (
                <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
            ) : (
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        border: "1px solid #eee",
                        borderRadius: "16px",
                        maxHeight: "600px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: "8px" },
                        "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: "10px" }
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" width="80px" sx={{ bgcolor: "grey.50", fontWeight: 700 }}>Rank</TableCell>
                                <TableCell sx={{ bgcolor: "grey.50", fontWeight: 700 }}>Team Name</TableCell>
                                <TableCell sx={{ bgcolor: "grey.50", fontWeight: 700 }}>Email</TableCell>
                                <TableCell align="center" sx={{ bgcolor: "grey.50", fontWeight: 700 }}>Members</TableCell>
                                <TableCell align="right" sx={{ bgcolor: "grey.50", fontWeight: 700 }}>Points</TableCell>
                                <TableCell align="center" width="120px" sx={{ bgcolor: "grey.50", fontWeight: 700 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboard.map((team, index) => (
                                <TableRow
                                    key={team.id}
                                    hover
                                    onClick={() => navigate(`/teams/${team.id}`)}
                                    sx={{
                                        cursor: "pointer",
                                        transition: 'background-color 0.2s',
                                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04) !important' },
                                        ...(index < (roundData?.countOfWinners || 0) && { bgcolor: 'rgba(76, 175, 80, 0.02)' })
                                    }}
                                >
                                    <TableCell align="center">
                                        {index === 0 ? <TrophyIcon sx={{ color: "gold" }} /> :
                                            index === 1 ? <TrophyIcon sx={{ color: "silver" }} /> :
                                                index === 2 ? <TrophyIcon sx={{ color: "#cd7f32" }} /> :
                                                    <Typography fontWeight={700} color="text.secondary">{index + 1}</Typography>}
                                    </TableCell>
                                    <TableCell><Typography fontWeight={600}>{team.name}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" color="text.secondary">{team.email}</Typography></TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'text.secondary' }}>
                                            <GroupIcon sx={{ fontSize: 18 }} />
                                            <Typography variant="body2" fontWeight={600}>{team.countOfMembers}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={team.points}
                                            color={index < (roundData?.countOfWinners || 0) ? "success" : "default"}
                                            variant="filled"
                                            sx={{ fontWeight: 700 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            {isAdmin && (
                                                <Tooltip title="Remove from Round">
                                                    <IconButton color="error" size="small" onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUnassignTeam(team.id);
                                                    }}>
                                                        <PersonRemoveIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {(isAdmin || team.id === myTeamId) && (
                                                <Tooltip title="View Stats">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={(e) => onOpenStats(team.id, e)}
                                                        sx={{ bgcolor: "primary.50" }}
                                                    >
                                                        <InsertChartOutlinedIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {leaderboard.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        {t("round_details.teams.no_data")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* The "Load More" Section */}
                    {hasMore && (
                        <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid #eee' }}>
                            <Button
                                onClick={onLoadMore}
                                disabled={isNextPageLoading}
                                startIcon={isNextPageLoading && <CircularProgress size={16} />}
                            >
                                {isNextPageLoading ? t("common.loading") : t("common.load_more")}
                            </Button>
                        </Box>
                    )}
                </TableContainer>
            )}
        </Box>
    );
};