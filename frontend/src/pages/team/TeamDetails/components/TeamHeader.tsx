import {Avatar, Box, Button, Grid, Paper, TextField, Typography} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";

export const TeamHeader = ({ team, isAdmin, isEditing, onEdit, onCancel, onSave, formData, setFormData, loading }: any) => {
    if (isEditing) {
        return (
            <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: "24px", bgcolor: "#f5f5f5", mb: 4, border: "2px dashed #ccc" }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Team Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Organization" value={formData.organization} onChange={e => setFormData({ ...formData, organization: e.target.value })} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Сontact" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 1 }}>
                        <Button
                            fullWidth
                            variant="contained" color="secondary"
                            startIcon={<SaveIcon />}
                            onClick={onSave}
                            disabled={loading}
                            sx={{ color: "black", fontWeight: 700, py: { xs: 1.5, sm: 1 } }}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button fullWidth variant="outlined" startIcon={<CancelIcon />} onClick={onCancel} color="inherit" sx={{ py: { xs: 1.5, sm: 1 } }}>
                            Cancel
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: "24px", bgcolor: "secondary.main", color: "white", mb: 4 }}>
            <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 3, sm: 0 }
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 3 }, width: "100%" }}>
                    <Avatar sx={{
                        width: { xs: 60, sm: 80 },
                        height: { xs: 60, sm: 80 },
                        bgcolor: "white",
                        color: "secondary.main",
                        fontSize: { xs: "1.5rem", sm: "2rem" },
                        fontWeight: 800,
                        flexShrink: 0
                    }}>
                        {team.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2.5rem" }, wordBreak: "break-word" }}>
                            {team.name}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, wordBreak: "break-word" }}>
                            {team.organization || "No Organization"}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, wordBreak: "break-word" }}>
                            {team.contact || "No contact"}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, display: "block", wordBreak: "break-all" }}>
                            {team.email}
                        </Typography>
                    </Box>
                </Box>
                {isAdmin && (
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={onEdit}
                        sx={{
                            bgcolor: "white",
                            color: "secondary.main",
                            borderRadius: "12px",
                            fontWeight: 700,
                            "&:hover": { bgcolor: "#eee" },
                            mt: { xs: 1, sm: 0 },
                            maxWidth: { sm: "160px" } // Обмежує ширину на десктопі, але дозволяє 100% на мобільних
                        }}
                    >
                        Edit Team
                    </Button>
                )}
            </Box>
        </Paper>
    );
};
