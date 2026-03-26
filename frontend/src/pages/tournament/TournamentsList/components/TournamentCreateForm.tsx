import {type ChangeEvent, useState} from "react";
import {Box, Button, CircularProgress, Container, Divider, Grid, Paper, TextField, Typography} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useTranslation} from "react-i18next";
import {tournamentService} from "../../../../services/impl/TournamentService";

const formatToLocalDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    return dateTimeStr.length === 16 ? `${dateTimeStr}:00` : dateTimeStr;
};

export const TournamentCreateForm = ({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "", description: "", startTournament: "",
        startRegistration: "", endRegistration: "",
        maxCountOfTeam: 16, countOfRounds: 4
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ["maxCountOfTeam", "countOfRounds"].includes(name) ? Number(value) : value
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                startTournament: formatToLocalDateTime(formData.startTournament),
                startRegistration: formatToLocalDateTime(formData.startRegistration),
                endRegistration: formatToLocalDateTime(formData.endRegistration),
            };
            await tournamentService.createTournament(payload);
            onSuccess();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={onCancel} sx={{ mb: 3 }}>
                {t("tournaments.admin.backToList")}
            </Button>
            <Paper sx={{ p: 4, borderRadius: "24px" }}>
                <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
                    {t("tournaments.admin.modal_title")}
                </Typography>
                <Divider sx={{ mb: 4 }} />
                <Grid container spacing={3}>
                    <Grid size={{xs:12}}>
                        <TextField label={t("tournaments.admin.fields.name")} name="name" fullWidth onChange={handleChange} required />
                    </Grid>
                    <Grid size={{xs:12}}>
                        <TextField label={t("tournaments.admin.fields.description")} name="description" multiline rows={4} fullWidth onChange={handleChange} required />
                    </Grid>
                    <Grid size={{xs:12, sm: 4}}>
                        <TextField label={t("tournaments.admin.fields.startTournament")} name="startTournament" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} onChange={handleChange} required />
                    </Grid>
                    <Grid size={{xs:12, sm: 4}}>
                        <TextField label={t("tournaments.admin.fields.startReg")} name="startRegistration" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} onChange={handleChange} required />
                    </Grid>
                    <Grid size={{xs:12, sm: 4}}>
                        <TextField label={t("tournaments.admin.fields.endReg")} name="endRegistration" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} onChange={handleChange} required />
                    </Grid>
                    <Grid size={{xs:12, sm: 6}}>
                        <TextField label={t("tournaments.admin.fields.maxTeams")} name="maxCountOfTeam" type="number" fullWidth defaultValue={16} onChange={handleChange} required />
                    </Grid>
                    <Grid size={{xs:12, sm: 6}}>
                        <TextField label={t("tournaments.admin.fields.rounds")} name="countOfRounds" type="number" fullWidth defaultValue={4} onChange={handleChange} required />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={onCancel}>{t("tournaments.admin.cancel")}</Button>
                    <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : t("tournaments.admin.submit")}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};