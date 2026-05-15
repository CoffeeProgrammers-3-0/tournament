import {useEffect, useMemo, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Pagination,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ViewListIcon from "@mui/icons-material/ViewList";
import {Client, type IMessage} from "@stomp/stompjs";
import SockJS from "sockjs-client";

import type {TeamLeaderboardResponseDto, TeamListResponseDto} from "../../../../../entities/team/team.dto";
import type {RoundFullResponseDto} from "../../../../../entities/round/round.dto";
import {RoundFormula} from "./RoundFormula.tsx";

type TeamViewMode = "all" | "leaderboard";

type Props = {
    maxPoints: number;
    leaderboard: TeamLeaderboardResponseDto[];
    setLeaderboard: React.Dispatch<React.SetStateAction<TeamLeaderboardResponseDto[]>>;
    loadingTab: boolean;
    hasMore: boolean;
    isNextPageLoading: boolean;
    onLoadMore: () => void;
    roundData: RoundFullResponseDto;
    onOpenStats: (teamId: number, e?: React.MouseEvent) => void;
    navigate: (path: string) => void;
    t: (key: string, options?: any) => string;
    isAdmin: boolean;
    onOpenAddMissingTeamsModal: () => void;
    onOpenAdvanceTeamsModal: () => void;
    onUnassignTeam: (teamId: number) => void;
    onExportLeaderboard: () => void;
    isExporting: boolean;
    onAssignAllTeams: () => void;
    onUnassignAllTeams: () => void;
    myTeamId?: number | string;

    allTeams: TeamListResponseDto[];
    loadingAllTeams: boolean;
    allTeamsPage: number;
    allTeamsTotalPages: number;
    setAllTeamsPage: (page: number) => void;
};

type WebSocketPayload = {
    type: "POINTS_CHANGED" | "TEAM_DELETED" | "TEAM_UNASSIGNED_FROM_ROUND" | "TEAM_ASSIGNED_TO_ROUND";
    content: any[];
};

const getTeamName = (team: any) => team.name || team.title || `#${team.id}`;
const getTeamEmail = (team: any) => team.email || "—";
const getPoints = (team: any) => team.points ?? 0;

export const RoundTeamsTab = ({
                                  setLeaderboard,
                                  leaderboard,
                                  loadingTab,
                                  hasMore,
                                  isNextPageLoading,
                                  onLoadMore,
                                  roundData,
                                  onOpenStats,
                                  navigate,
                                  t,
                                  isAdmin,
                                  onOpenAddMissingTeamsModal,
                                  onOpenAdvanceTeamsModal,
                                  onUnassignTeam,
                                  onExportLeaderboard,
                                  isExporting,
                                  onAssignAllTeams,
                                  onUnassignAllTeams,
                                  myTeamId,
                                  maxPoints,
                                  allTeams,
                                  loadingAllTeams,
                                  allTeamsPage,
                                  allTeamsTotalPages,
                                  setAllTeamsPage,
                              }: Props) => {
    const [viewMode, setViewMode] = useState<TeamViewMode>("all");

    const isAllEmpty = !loadingAllTeams && allTeams.length === 0;

    useEffect(() => {
        if (viewMode !== "leaderboard" || !roundData?.id) return;

        const updateWithWS = (message: IMessage) => {
            const payload: WebSocketPayload = JSON.parse(message.body);
            const {type, content} = payload;

            setLeaderboard((prevLeaderboard) => {
                let updated = [...prevLeaderboard];

                switch (type) {
                    case "TEAM_ASSIGNED_TO_ROUND": {
                        const newTeams = content.filter(
                            (newTeam: TeamLeaderboardResponseDto) => !prevLeaderboard.some((t) => t.id === newTeam.id),
                        );
                        updated = [...prevLeaderboard, ...newTeams];
                        break;
                    }

                    case "TEAM_UNASSIGNED_FROM_ROUND":
                    case "TEAM_DELETED": {
                        const idsToRemove = new Set(content.map((item: { id: number }) => item.id));
                        updated = prevLeaderboard.filter((t) => !idsToRemove.has(t.id));
                        break;
                    }

                    case "POINTS_CHANGED": {
                        const next = [...prevLeaderboard];

                        content.forEach((updatedTeam: TeamLeaderboardResponseDto) => {
                            const index = next.findIndex((t) => t.id === updatedTeam.id);

                            if (index !== -1) {
                                next[index] = {...next[index], ...updatedTeam};
                            } else {
                                const lowestVisiblePoints = next.length > 0 ? next[next.length - 1].points : 0;
                                if (updatedTeam.points > lowestVisiblePoints) {
                                    next.push(updatedTeam);
                                }
                            }
                        });

                        return next.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
                    }

                    default:
                        break;
                }

                return updated.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
            });
        };

        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL || ""}/ws`),
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                client.subscribe(`/topic/rounds/${roundData.id}/leaderboard`, (message) => {
                    updateWithWS(message);
                });
            },
            onStompError: (frame) => {
                console.error("Broker reported error: " + frame.headers["message"]);
                console.error("Additional details: " + frame.body);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [roundData?.id, setLeaderboard, viewMode]);

    const winnerCount = roundData?.countOfWinners || 0;

    const teamActions = (team: any) => {
        const canViewStats = isAdmin || String(team.id) === String(myTeamId);

        return (
            <Box sx={{display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap"}}>
                {viewMode === "all" && isAdmin && (
                    <Tooltip title={t("round_details.teams.remove_from_round", "Remove from round")}>
                        <IconButton
                            color="error"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUnassignTeam(team.id);
                            }}
                        >
                            <PersonRemoveIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                )}

                {viewMode === "leaderboard" && canViewStats && (
                    <Tooltip title={t("round_details.teams.view_stats", "View stats")}>
                        <IconButton
                            color="primary"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenStats(team.id, e);
                            }}
                            sx={{bgcolor: "primary.50"}}
                        >
                            <VisibilityIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        );
    };

    const allTeamsContent = useMemo(() => {
        return allTeams.map((team, index) => (
            <TableRow
                key={team.id}
                hover
                onClick={() => navigate(`/teams/${team.id}`)}
                sx={{
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    "&:hover": {bgcolor: "rgba(25, 118, 210, 0.04) !important"},
                }}
            >
                <TableCell align="center">
                    <Typography fontWeight={700} color="text.secondary">
                        {allTeamsPage * 10 + index + 1}
                    </Typography>
                </TableCell>

                <TableCell>
                    <Stack spacing={0.25}>
                        <Typography fontWeight={700}>{getTeamName(team)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            ID: {team.id}
                        </Typography>
                    </Stack>
                </TableCell>

                <TableCell>
                    <Typography variant="body2" color="text.secondary">
                        {getTeamEmail(team)}
                    </Typography>
                </TableCell>

                <TableCell align="center">
                    {teamActions(team)}
                </TableCell>
            </TableRow>
        ));
    }, [allTeams, allTeamsPage, navigate, onOpenStats, onUnassignTeam, isAdmin, myTeamId, t, viewMode]);

    const leaderboardContent = useMemo(() => {
        return leaderboard.map((team, index) => (
            <TableRow
                key={team.id}
                hover
                onClick={() => navigate(`/teams/${team.id}`)}
                sx={{
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    "&:hover": {bgcolor: "rgba(25, 118, 210, 0.04) !important"},
                    ...(index < winnerCount && {bgcolor: "rgba(76, 175, 80, 0.03)"}),
                }}
            >
                <TableCell align="center" width="90px">
                    {index === 0 ? (
                        <EmojiEventsIcon sx={{color: "gold"}}/>
                    ) : index === 1 ? (
                        <EmojiEventsIcon sx={{color: "silver"}}/>
                    ) : index === 2 ? (
                        <EmojiEventsIcon sx={{color: "#cd7f32"}}/>
                    ) : (
                        <Typography fontWeight={800} color="text.secondary">
                            {index + 1}
                        </Typography>
                    )}
                </TableCell>

                <TableCell>
                    <Stack spacing={0.25}>
                        <Typography fontWeight={800}>{getTeamName(team)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {getTeamEmail(team)}
                        </Typography>
                    </Stack>
                </TableCell>

                <TableCell align="right">
                    <Chip
                        label={`${getPoints(team)} / ${maxPoints}`}
                        color={index < winnerCount ? "success" : "default"}
                        sx={{fontWeight: 800, minWidth: 100}}
                    />
                </TableCell>

                <TableCell align="center">
                    {teamActions(team)}
                </TableCell>
            </TableRow>
        ));
    }, [leaderboard, maxPoints, navigate, onOpenStats, onUnassignTeam, isAdmin, myTeamId, t, viewMode, winnerCount]);

    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{
                    mb: 3,
                    p: { xs: 2, md: 3 }, 
                    borderRadius: 4,
                    background: "linear-gradient(135deg, rgba(15,23,42,0.03) 0%, rgba(59,130,246,0.04) 50%, rgba(255,255,255,1) 100%)",
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)", 
                }}
            >
                
                <Stack spacing={2.5}>

                    
                    
                    
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "flex-end" }}
                        spacing={2}
                    >
                        <Box>
                            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={1.2}>
                                {t("round_details.tabs.teams", "Teams")}
                            </Typography>

                            <Typography variant="h5" fontWeight={800} sx={{ mt: -0.5, mb: 0.5 }}>
                                {t("round_details.teams.title", "Teams overview")}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700 }}>
                                {viewMode === "all"
                                    ? t("round_details.teams.all_hint", "Full list of teams assigned to this round, with pagination.")
                                    : t("round_details.teams.leaderboard_hint", "Live leaderboard with scores, scroll loading, and instant updates.")}
                            </Typography>
                        </Box>

                        
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip
                                icon={<ViewListIcon fontSize="small" />}
                                label={`${t("round_details.teams.all", "All teams")}: ${allTeams.length}`}
                                variant="outlined"
                                sx={{ bgcolor: "background.paper" }}
                            />
                            <Chip
                                icon={<LeaderboardIcon fontSize="small" />}
                                label={`${t("round_details.teams.leaderboard", "Leaderboard")}: ${leaderboard.length}`}
                                variant="outlined"
                                sx={{ bgcolor: "background.paper" }}
                            />
                            <Chip
                                icon={<TrendingUpIcon fontSize="small" />}
                                label={`${t("round_details.teams.winners", "Winners")}: ${winnerCount}`}
                                variant="outlined"
                                sx={{ bgcolor: "background.paper" }}
                            />
                        </Stack>
                    </Stack>

                    
                    <Divider sx={{ borderStyle: "dashed", borderColor: "rgba(0,0,0,0.08)" }} />

                    
                    
                    
                    <Stack
                        direction={{ xs: "column", lg: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", lg: "center" }}
                        spacing={2}
                    >
                        
                        <ToggleButtonGroup
                            exclusive
                            value={viewMode}
                            onChange={(_, next) => next && setViewMode(next)}
                            size="small"
                            sx={{
                                justifyContent: { xs: "center", lg: "flex-start" },
                                bgcolor: "background.paper", 
                                "& .MuiToggleButton-root": {
                                    px: 3,
                                    py: 1,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                },
                            }}
                        >
                            <ToggleButton value="all">
                                {t("round_details.teams.all", "All teams")}
                            </ToggleButton>
                            <ToggleButton value="leaderboard">
                                {t("round_details.teams.leaderboard", "Leaderboard")}
                            </ToggleButton>
                        </ToggleButtonGroup>

                        
                        <Stack
                            direction="row"
                            flexWrap="wrap"
                            useFlexGap
                            justifyContent={{ xs: "center", lg: "flex-end" }}
                            alignItems="center"
                            spacing={1.5}
                        >
                            {viewMode === "leaderboard" && (
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={isExporting ? <CircularProgress size={18} color="inherit" /> : <FileDownloadIcon />}
                                    onClick={onExportLeaderboard}
                                    disabled={isExporting || leaderboard.length === 0}
                                    sx={{ textTransform: "none", bgcolor: "background.paper" }}
                                >
                                    {t("round_details.export_leaderboard")}
                                </Button>
                            )}

                            {isAdmin && (
                                <>
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        startIcon={<GroupAddIcon />}
                                        onClick={onAssignAllTeams}
                                        sx={{ textTransform: "none", bgcolor: "background.paper" }}
                                    >
                                        {t("round_details.teams.assign_all")}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<GroupRemoveIcon />}
                                        onClick={onUnassignAllTeams}
                                        disabled={viewMode === "leaderboard" ? leaderboard.length === 0 : allTeams.length === 0}
                                        sx={{ textTransform: "none", bgcolor: "background.paper" }}
                                    >
                                        {t("round_details.teams.unassign_all")}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<GroupAddIcon />}
                                        onClick={onOpenAddMissingTeamsModal}
                                        sx={{ textTransform: "none", bgcolor: "background.paper" }}
                                    >
                                        {t("modals.add_teams.title")}
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<FastForwardIcon />}
                                        onClick={onOpenAdvanceTeamsModal}
                                        disabled={leaderboard.length === 0}
                                        sx={{ textTransform: "none", boxShadow: 2 }}
                                    >
                                        {t("modals.advance_teams.title")}
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Stack>

                </Stack>
            </Paper>

            {viewMode === "all" ? (
                <Card
                    variant="outlined"
                    sx={{
                        borderRadius: 4,
                        overflow: "hidden",
                        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
                        borderColor: "divider",
                    }}
                >
                    <CardContent sx={{ p: 0 }}>
                        {loadingAllTeams ? (
                            <Box sx={{ py: 10, display: "flex", justifyContent: "center" }}>
                                <CircularProgress />
                            </Box>
                        ) : isAllEmpty ? (
                            <Box sx={{ p: { xs: 2, md: 4 } }}>
                                <Alert
                                    severity="warning"
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 3,
                                        alignItems: "center",
                                        mb: 2,
                                    }}
                                >
                                    <Typography fontWeight={800}>
                                        {t("round_details.teams.empty_all_title", "No teams in this round yet")}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t(
                                            "round_details.teams.empty_all_desc",
                                            "Please add users to this round first so the team list can appear here.",
                                        )}
                                    </Typography>
                                </Alert>

                                {isAdmin && (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            bgcolor: "background.paper",
                                        }}
                                    >
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={1.5}
                                            alignItems={{ xs: "stretch", sm: "center" }}
                                            justifyContent="space-between"
                                        >
                                            <Box>
                                                <Typography fontWeight={800}>
                                                    {t("round_details.teams.empty_all_admin_title", "Admin action required")}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {t(
                                                        "round_details.teams.empty_all_admin_desc",
                                                        "Add teams to this round to enable pagination, removal, and management actions.",
                                                    )}
                                                </Typography>
                                            </Box>

                                            <Button
                                                variant="contained"
                                                startIcon={<GroupAddIcon />}
                                                onClick={onOpenAddMissingTeamsModal}
                                            >
                                                {t("modals.add_teams.title", "Add teams")}
                                            </Button>
                                        </Stack>
                                    </Paper>
                                )}
                            </Box>
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        px: { xs: 2, md: 3 },
                                        py: 2,
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        bgcolor: "rgba(59,130,246,0.03)",
                                    }}
                                >
                                    <Stack
                                        direction={{ xs: "column", md: "row" }}
                                        justifyContent="space-between"
                                        gap={2}
                                        alignItems={{ md: "center" }}
                                    >
                                        <Box>
                                            <Typography fontWeight={800}>
                                                {t("round_details.teams.all_title", "All teams in round")}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t(
                                                    "round_details.teams.all_hint",
                                                    "Paged list of every team assigned to this round.",
                                                )}
                                            </Typography>
                                        </Box>

                                        <Chip
                                            icon={<ViewListIcon fontSize="small" />}
                                            label={`${t("round_details.teams.all", "All teams")}: ${allTeams.length}`}
                                            variant="outlined"
                                            sx={{ fontWeight: 700 }}
                                        />
                                    </Stack>
                                </Box>

                                <TableContainer sx={{ overflowX: "auto" }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" width="90">
                                                    #
                                                </TableCell>
                                                <TableCell>{t("round_details.teams.name", "Team")}</TableCell>
                                                <TableCell>{t("round_details.teams.email", "Email")}</TableCell>
                                                <TableCell align="center" width="160">
                                                    {t("common.actions", "Actions")}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {allTeamsContent}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Box sx={{ p: 2, display: "flex", justifyContent: "center", borderTop: "1px solid", borderColor: "divider" }}>
                                    <Pagination
                                        page={allTeamsPage + 1}
                                        count={Math.max(allTeamsTotalPages, 1)}
                                        onChange={(_, page) => setAllTeamsPage(page - 1)}
                                        color="primary"
                                    />
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Box>
                    <RoundFormula t={t}/>
                    <Card variant="outlined" sx={{borderRadius: 4, overflow: "hidden"}}>
                        <CardContent sx={{p: 0}}>
                            {loadingTab ? (
                                <Box sx={{py: 8, display: "flex", justifyContent: "center"}}>
                                    <CircularProgress/>
                                </Box>
                            ) : (
                                <TableContainer
                                    component={Paper}
                                    elevation={0}
                                    sx={{
                                        maxHeight: 680,
                                        overflowY: "auto",
                                        "&::-webkit-scrollbar": {width: 8},
                                        "&::-webkit-scrollbar-thumb": {
                                            backgroundColor: "#cbd5e1",
                                            borderRadius: 999,
                                        },
                                    }}
                                >
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" width="90px">
                                                    Rank
                                                </TableCell>
                                                <TableCell>{t("round_details.teams.name", "Team")}</TableCell>
                                                <TableCell
                                                    align="right">{t("round_details.teams.points", "Points")}</TableCell>
                                                <TableCell align="center" width="160px">
                                                    {t("common.actions", "Actions")}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {leaderboardContent}
                                            {leaderboard.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center"
                                                               sx={{py: 5, color: "text.secondary"}}>
                                                        {t("round_details.teams.no_data")}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                    {hasMore && (
                                        <Box sx={{
                                            p: 2,
                                            textAlign: "center",
                                            borderTop: "1px solid",
                                            borderColor: "divider"
                                        }}>
                                            <Button
                                                onClick={onLoadMore}
                                                disabled={isNextPageLoading}
                                                startIcon={isNextPageLoading ?
                                                    <CircularProgress size={16}/> : undefined}
                                            >
                                                {isNextPageLoading ? t("common.loading") : t("common.load_more")}
                                            </Button>
                                        </Box>
                                    )}
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
};