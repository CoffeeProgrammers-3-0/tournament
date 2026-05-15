import {useMemo, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    MenuItem,
    Modal,
    Select,
    TextField,
    Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FastForwardIcon from "@mui/icons-material/FastForward";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupIcon from "@mui/icons-material/Group";
import {ErrorMessages} from "../../../../../components/main/ErrorMessages.tsx";

type AddModalProps = {
    open: boolean;
    onClose: () => void;
    teams: any[];
    selectedIds: number[];
    onSelect: (id: number) => void;
    onSelectAll: (ids: number[]) => void;
    onConfirm: () => void;
    isLoading: boolean;
    t: (key: string, options?: any) => string;
    errors: string[];
};


export const AddMissingTeamsModal = ({
                                         open, onClose, teams, selectedIds, onSelect, onSelectAll, onConfirm, isLoading, t, errors
                                     }: AddModalProps) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTeams = useMemo(() =>
            teams.filter((t: any) => t.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [teams, searchTerm]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 500, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 24, overflow: 'hidden'
            }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupAddIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                            {t("modals.add_teams.title")}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorMessages errors={errors} />
                        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                    </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                    <TextField
                        fullWidth size="small" placeholder={t("modals.add_teams.search_placeholder")} variant="outlined"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 2 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">{t("modals.add_teams.available_header")}</Typography>
                        <Button size="small" sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                                onClick={() => onSelectAll(filteredTeams.map((t: any) => t.id))}>
                            {t("modals.add_teams.select_all")}
                        </Button>
                    </Box>

                    <List sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                        {filteredTeams.length === 0 && <Typography p={2} textAlign="center" color="text.secondary">{t("modals.add_teams.no_teams")}</Typography>}
                        {filteredTeams.map((team: any) => (
                            <ListItem key={team.id} disablePadding>
                                <ListItemButton onClick={() => onSelect(team.id)} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                    <Checkbox checked={selectedIds.includes(team.id)} color="primary" disableRipple />
                                    <ListItemText primary={team.name} secondary={team.email} primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
                    <Button onClick={onClose} variant="outlined" color="inherit">{t("common.cancel")}</Button>
                    <Button variant="contained" disabled={selectedIds.length === 0 || isLoading} onClick={onConfirm} sx={{ px: 4, borderRadius: 2 }}>
                        {t("modals.add_teams.submit", { count: selectedIds.length })}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

type AdvanceModalProps = {
    open: boolean;
    onClose: () => void;
    leaderboard: any[];
    selectedIds: number[];
    onSelect: (id: number) => void;
    onConfirm: () => void;
    rounds: any[];
    targetRound: number | null;
    setTargetRound: (id: number) => void;
    isLoading: boolean;
    maxCountOfTeam?: number;
    errors: string[];
    t: (key: string, options?: any) => string;
};


export const AdvanceTeamsModal = ({
                                      open, onClose, leaderboard, selectedIds, onSelect, onConfirm, rounds, targetRound, setTargetRound, isLoading, maxCountOfTeam, t, errors
                                  }: AdvanceModalProps) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 550, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 24, overflow: 'hidden'
            }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FastForwardIcon />
                        <Typography variant="h6" fontWeight={700}>
                            {t("modals.advance_teams.title")}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorMessages errors={errors} />
                        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}><CloseIcon /></IconButton>
                    </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>{t("modals.advance_teams.target_round")}</InputLabel>
                        <Select
                            value={targetRound || ""}
                            onChange={(e) => setTargetRound(Number(e.target.value))}
                            label={t("modals.advance_teams.target_round")}
                        >
                            {rounds.map((r: any) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                        {t("modals.advance_teams.subtitle")}
                    </Typography>

                    <List sx={{ maxHeight: 350, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        {leaderboard.map((team: any, index: number) => {
                            const isSelected = selectedIds.includes(team.id);
                            return (
                                <ListItem key={team.id} disablePadding>
                                    <ListItemButton onClick={() => onSelect(team.id)}>
                                        <Checkbox checked={isSelected} color="primary" />
                                        <Box sx={{ width: 30, mr: 1 }}><Typography fontWeight={700} color="text.secondary">#{index + 1}</Typography></Box>
                                        <ListItemText
                                            primary={team.name}
                                            secondary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <Typography variant="caption" fontWeight={700} color="secondary">
                                                        {team.points} {t("common.points_short")}
                                                    </Typography>
                                                    <Typography variant="caption" color="divider">|</Typography>
                                                    <GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {team.countOfMembers} {maxCountOfTeam ? `/ ${maxCountOfTeam}` : ''}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        {isSelected && <Chip size="small" label={t("modals.advance_teams.advancing_status")} color="success" variant="outlined" />}
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
                    <Button onClick={onClose} variant="outlined">{t("common.cancel")}</Button>
                    <Button variant="contained" disabled={!targetRound || selectedIds.length === 0 || isLoading} onClick={onConfirm}>
                        {t("modals.advance_teams.submit", { count: selectedIds.length })}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};