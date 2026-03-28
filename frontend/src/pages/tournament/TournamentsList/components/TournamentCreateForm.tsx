import {type ChangeEvent, useState} from "react";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Paper,
    TextField,
    Typography
} from "@mui/material";
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

    // Стан для масиву помилок
    const [errors, setErrors] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: "", description: "",
        startRegistration: "", endRegistration: "",
        maxCountOfTeam: 16, countOfRounds: 4
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Очищуємо помилки, коли користувач починає щось виправляти
        if (errors.length > 0) setErrors([]);

        setFormData(prev => ({
            ...prev,
            [name]: ["maxCountOfTeam", "countOfRounds"].includes(name) ? Number(value) : value
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors([]); // Скидаємо старі помилки

        try {
            const payload = {
                ...formData,
                startTournament: formatToLocalDateTime(formData.endRegistration),
                startRegistration: formatToLocalDateTime(formData.startRegistration),
                endRegistration: formatToLocalDateTime(formData.endRegistration),
            };
            await tournamentService.createTournament(payload);
            onSuccess();
        } catch (e: any) {
            console.error(e);
            // Витягуємо масив повідомлень з відповіді сервера
            const serverMessages = e.response?.data?.messages;
            if (Array.isArray(serverMessages)) {
                setErrors(serverMessages);
            } else {
                setErrors([t("common.errors.unknown") || "An unexpected error occurred"]);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={onCancel} sx={{ mb: 3 }}>
                {t("tournaments.admin.backToList")}
            </Button>

            <Paper sx={{ p: 4, borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
                    {t("tournaments.admin.modal_title")}
                </Typography>

                <Divider sx={{ mb: 4 }} />

                {/* Вивід помилок через Alert */}
                {errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 4, borderRadius: "12px" }}>
                        <AlertTitle>{t("common.errors.title") || "Помилка валідації"}</AlertTitle>
                        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                            {errors.map((msg, index) => (
                                <li key={index} style={{ marginBottom: "4px" }}>
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid size={{xs:12}}>
                        <TextField
                            label={t("tournaments.admin.fields.name")}
                            name="name"
                            fullWidth
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid size={{xs:12}}>
                        <TextField
                            label={t("tournaments.admin.fields.description")}
                            name="description"
                            multiline rows={4}
                            fullWidth
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid size={{xs:12, sm: 6}}>
                        <TextField
                            label={t("tournaments.admin.fields.startReg")}
                            name="startRegistration"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid size={{xs:12, sm: 6}}>
                        <TextField
                            label={t("tournaments.admin.fields.endReg")}
                            name="endRegistration"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            onChange={handleChange}
                            required
                            inputProps={{ min: formData.startRegistration || undefined }}
                        />
                    </Grid>
                    <Grid size={{xs:12, sm: 6}}>
                        <TextField
                            label={t("tournaments.admin.fields.maxTeams")}
                            name="maxCountOfTeam"
                            type="number"
                            fullWidth
                            defaultValue={16}
                            onChange={handleChange}
                            required
                            inputProps={{ min: 1 }}
                        />
                    </Grid>
                    <Grid size={{xs:12, sm: 6}}>
                        <TextField
                            label={t("tournaments.admin.fields.rounds")}
                            name="countOfRounds"
                            type="number"
                            fullWidth
                            defaultValue={4}
                            onChange={handleChange}
                            required
                            inputProps={{ min: 1 }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: "10px" }}>
                        {t("tournaments.admin.cancel")}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        sx={{ borderRadius: "10px", px: 4, fontWeight: 700 }}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : t("tournaments.admin.submit")}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};