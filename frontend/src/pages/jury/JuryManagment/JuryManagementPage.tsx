import {
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    InputAdornment,
    Pagination,
    Tab,
    Tabs,
    TextField,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import SearchIcon from "@mui/icons-material/Search";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useJuryList} from "./useJuryList";
import {JuryCard} from "./components/JuryCard";
import {CreateJuryTab} from "./components/CreateJuryTab";
import {userService} from "../../../services/impl/UserService";

import {ErrorMessages} from "../../../components/main/ErrorMessages"; // Припускаємо наявність

export const JuryManagementPage = () => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name: string }>({
        open: false, id: null, name: ""
    });

    const {
        juries, loading, page, setPage, totalPages,
        searchQuery, setSearchQuery, deleteJury, refresh
    } = useJuryList();

    const handleUpdateJury = async (id: number, fullName: string) => {
        setErrors([]);
        try {
            await userService.updateUser(id, { fullName });
            refresh();
            return true;
        } catch (e: any) {
            const messages = e.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : [t("juries.update_failed")]);
            return false;
        }
    };

    const confirmDelete = async () => {
        if (deleteConfirm.id) {
            await deleteJury(deleteConfirm.id);
            setDeleteConfirm({ open: false, id: null, name: "" });
        }
    };

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: 1 }}>
            {/* Header Paper remains same */}

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 4, "& .MuiTab-root": { fontWeight: 700 } }}>
                <Tab icon={<GroupsIcon />} iconPosition="start" label={t("juries.tabs.list")} />
                <Tab icon={<PersonAddAlt1Icon />} iconPosition="start" label={t("juries.tabs.create")} />
            </Tabs>

            {/* Вивід помилок над контентом */}
            <ErrorMessages errors={errors} />

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
                                    <Grid size={{xs:12,sm:6,md:4}} key={j.id}>
                                        <JuryCard
                                            jury={j}
                                            t={t}
                                            onUpdate={handleUpdateJury}
                                            onDelete={(id: number, name: string) => setDeleteConfirm({ open: true, id, name })}
                                        />
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

            {/* MODERN DELETE CONFIRMATION */}
            <Dialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null, name: "" })}
                PaperProps={{ sx: { borderRadius: "20px" } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>{t("juries.delete_title", "Видалити журі?")}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t("juries.delete_text", "Ви впевнені, що хочете видалити")} <b>{deleteConfirm.name}</b>? {t("juries.delete_warning", "Цю дію неможливо скасувати.")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, id: null, name: "" })} variant="outlined" sx={{ borderRadius: "10px" }}>
                        {t("common.no")}
                    </Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" sx={{ borderRadius: "10px", fontWeight: 700 }}>
                        {t("common.yes_confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};