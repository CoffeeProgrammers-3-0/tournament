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

// Modal 1: Add missing teams to the current round
export const AddMissingTeamsModal = ({
                                         open, onClose, teams, selectedIds, onSelect, onSelectAll, onConfirm, isLoading
                                     }: any) => {
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
                    <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1}>
                        <GroupAddIcon color="primary" /> Add Teams to Round
                    </Typography>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Box>

                <Box sx={{ p: 3 }}>
                    <TextField
                        fullWidth size="small" placeholder="Search teams..." variant="outlined"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 2 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Available Teams:</Typography>
                        <Button size="small" sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                                onClick={() => onSelectAll(filteredTeams.map((t: any) => t.id))}>
                            Select All
                        </Button>
                    </Box>

                    <List sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                        {filteredTeams.length === 0 && <Typography p={2} textAlign="center" color="text.secondary">No teams found</Typography>}
                        {filteredTeams.map((team: any) => (
                            <ListItem key={team.id} disablePadding>
                                <ListItemButton onClick={() => onSelect(team.id)} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                    <Checkbox
                                        checked={selectedIds.includes(team.id)}
                                        color="primary"
                                        disableRipple // Опціонально: вимикає зайвий ripple ефект на самому чекбоксі
                                    />
                                    <ListItemText
                                        primary={team.name}
                                        secondary={team.email}
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
                    <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
                    <Button variant="contained" disabled={selectedIds.length === 0 || isLoading} onClick={onConfirm} sx={{ px: 4, borderRadius: 2 }}>
                        Add ({selectedIds.length})
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

// Modal 2: Advance teams to another round (Pre-selects winners)
export const AdvanceTeamsModal = ({
                                      open, onClose, leaderboard, selectedIds, onSelect, onConfirm, rounds, targetRound, setTargetRound, isLoading
                                  }: any) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 550, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 24, overflow: 'hidden'
            }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1}>
                        <FastForwardIcon /> Advance Teams to Next Round
                    </Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </Box>

                <Box sx={{ p: 3 }}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Target Round</InputLabel>
                        <Select
                            value={targetRound || ""}
                            onChange={(e) => setTargetRound(Number(e.target.value))}
                            label="Target Round"
                        >
                            {rounds.map((r: any) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                        Review and select teams to advance (Winners pre-selected):
                    </Typography>

                    <List sx={{ maxHeight: 350, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                        {leaderboard.map((team: any, index: number) => (
                            <ListItem key={team.id} disablePadding>
                                <ListItemButton
                                    onClick={() => onSelect(team.id)}
                                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <Checkbox
                                        checked={selectedIds.includes(team.id)}
                                        color="primary"
                                        disableRipple // Запобігає накладанню ефекту кліку чекбокса та кнопки
                                    />

                                    <Box sx={{ width: 30, textAlign: 'center', mr: 1 }}>
                                        <Typography fontWeight={700} color="text.secondary">
                                            #{index + 1}
                                        </Typography>
                                    </Box>

                                    <ListItemText
                                        primary={team.name}
                                        secondary={`${team.points} pts`}
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                    />

                                    {selectedIds.includes(team.id) && (
                                        <Chip
                                            size="small"
                                            label="Advancing"
                                            color="success"
                                            variant="outlined"
                                        />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
                    <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
                    <Button variant="contained" disabled={!targetRound || selectedIds.length === 0 || isLoading} onClick={onConfirm} sx={{ px: 4, borderRadius: 2 }}>
                        Advance ({selectedIds.length}) Teams
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};