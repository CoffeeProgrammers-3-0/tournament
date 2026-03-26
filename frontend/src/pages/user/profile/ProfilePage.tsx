import {Box, CircularProgress, Grid, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useProfile} from "./useProfile";
import {ProfileInfoCard} from "./components/ProfileInfoCard";
import {ProfileTeamsList} from "./components/ProfileTeamsList";
import {ProfileTournamentsList} from "./components/ProfileTournamentsList";

export const ProfilePage = () => {
    const { t } = useTranslation();
    const {
        user, teams, tournaments, loading,
        isEditing, setIsEditing, editName, setEditName,
        isSaving, handleSaveProfile, cancelEditing
    } = useProfile();

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
        </Box>
    );

    if (!user) return (
        <Typography variant="h6" align="center" sx={{ mt: 10 }}>
            {t("profile.error_loading")}
        </Typography>
    );

    return (
        <Box sx={{ pb: 8, pt: 2 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
                {t("profile.title")}
            </Typography>

            <Grid container spacing={4}>
                <Grid size={{xs:12, md: 4}}>
                    <ProfileInfoCard
                        user={user}
                        isEditing={isEditing}
                        editName={editName}
                        isSaving={isSaving}
                        onEdit={() => setIsEditing(true)}
                        onSave={handleSaveProfile}
                        onCancel={cancelEditing}
                        onNameChange={setEditName}
                    />
                </Grid>

                <Grid size={{xs:12, md: 4}}>
                    <ProfileTeamsList teams={teams} />
                </Grid>

                <Grid size={{xs:12, md: 4}}>
                    <ProfileTournamentsList tournaments={tournaments} />
                </Grid>
            </Grid>
        </Box>
    );
};