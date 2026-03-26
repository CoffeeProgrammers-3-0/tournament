import {
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    InputAdornment,
    Pagination,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import SearchIcon from "@mui/icons-material/Search";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useJuryList} from "./useJuryList";
import {JuryCard} from "./components/JuryCard";
import {CreateJuryTab} from "./components/CreateJuryTab";
import {userService} from "../../../services/impl/UserService";

export const JuryManagementPage = () => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);
    const [editingJury, setEditingJury] = useState<any>(null);

    const {
        juries, loading, page, setPage, totalPages,
        searchQuery, setSearchQuery, deleteJury, refresh
    } = useJuryList();

    const handleUpdate = async () => {
        try {
            await userService.updateUser(editingJury.id, {
                fullName: editingJury.fullName,
            });
            setEditingJury(null);
            refresh();
        } catch (e) {
            alert("Update failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm(t("juries.delete_confirm"))) {
            await deleteJury(id);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: 1 }}>
            {/* Unified Header */}
            <Paper elevation={0} sx={{
                p: 5, borderRadius: "32px", mb: 5,
                background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                color: "white", position: "relative", overflow: "hidden"
            }}>
                <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Typography variant="h3" fontWeight={900}>{t("juries.management_title")}</Typography>
                    <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400 }}>{t("juries.management_subtitle")}</Typography>
                </Box>
                <GavelIcon sx={{ position: "absolute", right: -20, bottom: -40, fontSize: 250, opacity: 0.1, transform: "rotate(-15deg)" }} />
            </Paper>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 4, "& .MuiTab-root": { fontWeight: 700 } }}>
                <Tab icon={<GroupsIcon />} iconPosition="start" label={t("juries.tabs.list")} />
                <Tab icon={<PersonAddAlt1Icon />} iconPosition="start" label={t("juries.tabs.create")} />
            </Tabs>

            {tabValue === 0 ? (
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
                        <TextField
                            placeholder={t("juries.search_placeholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ width: 350, "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "white" } }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                        />
                    </Box>

                    {loading && juries.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 10 }}><CircularProgress /></Box>
                    ) : (
                        <>
                            <Grid container spacing={3}>
                                {juries.map(j => (
                                    <Grid size={{xs: 12, sm: 6, md: 4}} key={j.id}>
                                        <JuryCard jury={j} t={t} onDelete={handleDelete} onEdit={setEditingJury} />
                                    </Grid>
                                ))}
                            </Grid>
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
                            </Box>
                        </>
                    )}
                </Box>
            ) : (
                <CreateJuryTab t={t} onSuccess={() => { setTabValue(0); refresh(); }} />
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingJury} onClose={() => setEditingJury(null)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight={800}>{t("common.edit")}</DialogTitle>
                <DialogContent sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                    <TextField
                        fullWidth label="Full Name"
                        value={editingJury?.fullName || ""}
                        onChange={e => setEditingJury({...editingJury, fullName: e.target.value})}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditingJury(null)}>{t("common.cancel")}</Button>
                    <Button onClick={handleUpdate} variant="contained" sx={{ borderRadius: "10px" }}>{t("common.save")}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};