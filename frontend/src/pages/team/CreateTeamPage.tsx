import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Divider, Grid, Paper, TextField, Typography, MenuItem, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const DEFAULT_MAX_MEMBERS = 5;
const MIN_MEMBERS = 2;

export const CreateTeamPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tournamentId } = useParams();

    const [formData, setFormData] = useState({
        teamName: "",
        captainName: "",
        captainEmail: "",
        members: [
            { name: "", email: "" },
            { name: "", email: "" }
        ],
        tournamentId: tournamentId || ""
    });
    const [maxMembers] = useState(DEFAULT_MAX_MEMBERS); // TODO: fetch from config if available
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx?: number) => {
        const { name, value } = e.target;
        if (name.startsWith("member-") && typeof idx === "number") {
            const field = name.split("-")[1];
            setFormData(prev => {
                const members = [...prev.members];
                members[idx] = { ...members[idx], [field]: value };
                return { ...prev, members };
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addMember = () => {
        if (formData.members.length < maxMembers) {
            setFormData(prev => ({ ...prev, members: [...prev.members, { name: "", email: "" }] }));
        }
    };
    const removeMember = (idx: number) => {
        if (formData.members.length > MIN_MEMBERS) {
            setFormData(prev => ({ ...prev, members: prev.members.filter((_, i) => i !== idx) }));
        }
    };

    const validate = () => {
        // Required fields
        if (!formData.teamName.trim() || !formData.captainName.trim() || !formData.captainEmail.trim()) {
            setError("All required fields must be filled.");
            return false;
        }
        // Tournament ID must be > 0
        const tidNum = Number(formData.tournamentId);
        if (isNaN(tidNum) || tidNum < 1) {
            setError("Tournament ID must be greater than 0.");
            return false;
        }
        // Members count
        if (formData.members.length < MIN_MEMBERS) {
            setError(`At least ${MIN_MEMBERS} members required.`);
            return false;
        }
        // Emails unique, normalized, and valid
        const emails = [formData.captainEmail, ...formData.members.map(m => m.email)]
            .map(e => e.trim().toLowerCase());
        const emailSet = new Set(emails);
        if (emailSet.size !== emails.length) {
            setError("Emails must be unique.");
            return false;
        }
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emails.every(e => emailRegex.test(e))) {
            setError("Invalid email format.");
            return false;
        }
        setError(null);
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSuccess(true);
        setError(null);
        setFormData({
            teamName: "",
            captainName: "",
            captainEmail: "",
            members: [
                { name: "", email: "" },
                { name: "", email: "" }
            ],
            tournamentId: tournamentId || ""
        });
    };

    return (
        <Box sx={{ pb: 8, maxWidth: "700px", mx: "auto" }}>
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
                    Register New Team
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Fill in the team and member details to register for the tournament.
                </Typography>
                <Divider sx={{ mb: 4 }} />
                <Grid container spacing={3}>
                    <Grid>
                        <TextField
                            label="Team Name"
                            name="teamName"
                            fullWidth
                            required
                            value={formData.teamName}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid>
                        <TextField
                            label="Captain Name"
                            name="captainName"
                            fullWidth
                            required
                            value={formData.captainName}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid>
                        <TextField
                            label="Captain Email"
                            name="captainEmail"
                            type="email"
                            fullWidth
                            required
                            value={formData.captainEmail}
                            onChange={handleChange}
                        />
                    </Grid>
                    {formData.members.map((member, idx) => (
                        <Grid container spacing={1} alignItems="center" key={idx}>
                            <Grid>
                                <TextField
                                    label={`Member ${idx + 1} Name`}
                                    name="member-name"
                                    fullWidth
                                    required
                                    value={member.name}
                                    onChange={e => handleChange(e as React.ChangeEvent<HTMLInputElement>, idx)}
                                />
                            </Grid>
                            <Grid>
                                <TextField
                                    label={`Member ${idx + 1} Email`}
                                    name="member-email"
                                    type="email"
                                    fullWidth
                                    required
                                    value={member.email}
                                    onChange={e => handleChange(e as React.ChangeEvent<HTMLInputElement>, idx)}
                                />
                            </Grid>
                            <Grid>
                                <Box display="flex" alignItems="center">
                                    <IconButton onClick={() => removeMember(idx)} disabled={formData.members.length <= MIN_MEMBERS}>
                                        <RemoveIcon />
                                    </IconButton>
                                    {idx === formData.members.length - 1 && formData.members.length < maxMembers && (
                                        <IconButton onClick={addMember}>
                                            <AddIcon />
                                        </IconButton>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    ))}
                    {!tournamentId && (
                        <Grid>
                            <TextField
                                select
                                label="Select Tournament"
                                name="tournamentId"
                                fullWidth
                                required
                                value={formData.tournamentId}
                                onChange={handleChange}
                            >
                                {/* TODO: Replace with real tournament list */}
                                <MenuItem value="1">Spring Hackathon 2026</MenuItem>
                                <MenuItem value="2">Winter Code Jam</MenuItem>
                            </TextField>
                        </Grid>
                    )}
                </Grid>
                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                {success && <Typography color="success.main" sx={{ mt: 2 }}>Team registered successfully!</Typography>}
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
                        Register Team
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};
