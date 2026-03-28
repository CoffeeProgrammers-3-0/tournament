import {Avatar, Box, Button, Grid, Paper, TextField, Typography} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";

export const TeamHeader = ({
                               team,
                               isAdmin,
                               isEditing,
                               onEdit,
                               onCancel,
                               onSave,
                               formData,
                               setFormData,
                               loading
                           }: any) => {
    if (isEditing) {
        return (
            <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "#f5f5f5", mb: 4, border: "2px dashed #ccc" }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{xs:12, md:4}}>
                        <TextField
                            fullWidth label="Team Name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </Grid>
                    <Grid size={{xs:12, md:4}}>
                        <TextField
                            fullWidth label="Organization"
                            value={formData.organization}
                            onChange={e => setFormData({ ...formData, organization: e.target.value })}
                        />
                    </Grid>
                    <Grid size={{xs:12, md:4}}>
                        <TextField
                            fullWidth label="Email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </Grid>
                    <Grid size={{xs:12}} sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Button
                            variant="contained" color="secondary"
                            startIcon={<SaveIcon />}
                            onClick={onSave}
                            disabled={loading}
                            sx={{ color: "black", fontWeight: 700 }}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="outlined" startIcon={<CancelIcon />} onClick={onCancel} color="inherit">
                            Cancel
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "secondary.main", color: "white", mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: "white", color: "secondary.main", fontSize: "2rem", fontWeight: 800 }}>
                        {team.name.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h3" fontWeight={800}>{team.name}</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>{team.organization || "No Organization"}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, display: "block" }}>{team.email}</Typography>
                    </Box>
                </Box>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={onEdit}
                        sx={{ bgcolor: "white", color: "secondary.main", borderRadius: "12px", fontWeight: 700, "&:hover": { bgcolor: "#eee" } }}
                    >
                        Edit Team
                    </Button>
                )}
            </Box>
        </Paper>
    );
};