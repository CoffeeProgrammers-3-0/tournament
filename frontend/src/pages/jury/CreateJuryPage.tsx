import { useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { useTranslation } from "react-i18next";
import {
    Box, Button, Divider, Grid, Paper, TextField, Typography, MenuItem
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

export const CreateJuryPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tournamentId } = useParams(); 

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        tournamentId: tournamentId || ""
    });

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Submitting to backend:", formData);

        try {
            navigate(-1);
        } catch (error) {
            console.error("Failed to create jury", error);
        }
    };

    return (
        <Box sx={{ pb: 8, maxWidth: "600px", mx: "auto" }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, textTransform: "none" }}
            >
                {t('common.back', 'Back')}
            </Button>

            <Paper
                component="form"
                onSubmit={handleSubmit}
                sx={{ p: 4, borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.05)" }}
            >
                <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                    Create New Jury
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    This will create a user and assign them to a tournament.
                </Typography>
                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}> 
                        <TextField
                            label="Full Name"
                            name="fullName"
                            fullWidth
                            required
                            value={formData.fullName}
                            onChange={handleFormChange}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}> 
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            fullWidth
                            required
                            value={formData.email}
                            onChange={handleFormChange}
                        />
                    </Grid>
                    {!tournamentId && (
                        <Grid size={{ xs: 12 }}> 
                            <TextField
                                select
                                label="Assign to Tournament"
                                name="tournamentId"
                                fullWidth
                                required
                                value={formData.tournamentId}
                                onChange={handleFormChange}
                            >
                                <MenuItem value="1">Spring Hackathon 2026</MenuItem>
                                <MenuItem value="2">Winter Code Jam</MenuItem>
                            </TextField>
                        </Grid>
                    )}
                </Grid>

                <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        sx={{ px: 4, fontWeight: 700 }}
                    >
                        Create Jury
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};