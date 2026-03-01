import {type ChangeEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    Box,
    Button,
    Divider,
    Grid,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import type {UserCreateRequestDto} from "../../entities/user/user.dto.ts";

export const CreateJuryPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<UserCreateRequestDto>({
        fullName: "",
        email: ""
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); 
        
        if (!formData.fullName || !formData.email) {
            alert("Please fill in all fields");
            return;
        }

        console.log("Creating jury:", formData);

        navigate(-1);
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
                component="form" // Renders as a <form>
                onSubmit={handleSubmit}
                sx={{ p: 4, borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.05)" }}
            >
                <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                    {t('jury.create_title', 'Create New Jury')}
                </Typography>
                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            label={t('user.full_name', 'Full Name')}
                            name="fullName"
                            fullWidth
                            required
                            value={formData.fullName}
                            onChange={handleFormChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label={t('user.email', 'Email')}
                            name="email"
                            type="email"
                            fullWidth
                            required
                            value={formData.email}
                            onChange={handleFormChange}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        type="submit" // Triggers onSubmit
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        sx={{ px: 4, fontWeight: 700 }}
                    >
                        {t('jury.save_button', 'Create Jury')}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};