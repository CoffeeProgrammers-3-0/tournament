import {useState} from "react";
import {Alert, Avatar, Box, Button, CircularProgress, Grid, Paper, TextField, Typography} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import SaveIcon from "@mui/icons-material/Save";
import {userService} from "../../../../services/impl/UserService";

export const CreateJuryTab = ({ t, onSuccess }: any) => {
    const [formData, setFormData] = useState({ fullName: "", email: "" });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            await userService.createJury(formData);
            setStatus({ type: 'success', msg: t("create_jury.success") });
            setTimeout(() => {
                setFormData({ fullName: "", email: "" });
                onSuccess();
            }, 1500);
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.message || "Error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: "600px", mx: "auto", mt: 2 }}>
            <Paper elevation={0} sx={{ p: 5, borderRadius: "32px", border: "1px solid #eee" }}>
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}><PersonAddAlt1Icon /></Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight={800}>{t("create_jury.title")}</Typography>
                        <Typography variant="body2" color="text.secondary">{t("create_jury.subtitle")}</Typography>
                    </Box>
                </Box>

                {status && <Alert severity={status.type} sx={{ mb: 3, borderRadius: "12px" }}>{status.msg}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{xs: 12}}>
                            <TextField
                                fullWidth label={t("create_jury.fields.full_name")} required
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                            />
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <TextField
                                fullWidth label={t("create_jury.fields.email")} type="email" required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <Button
                                type="submit" fullWidth variant="contained" size="large"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                sx={{ py: 1.5, borderRadius: "14px", fontWeight: 700 }}
                            >
                                {t("create_jury.actions.submit")}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};