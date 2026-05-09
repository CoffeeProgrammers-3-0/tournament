import {Box, CircularProgress, Grid, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useProfile} from "./useProfile";
import {ProfileInfoCard} from "./components/ProfileInfoCard";
import {ProfileTeamsList} from "./components/ProfileTeamsList";
import {ProfileTournamentsList} from "./components/ProfileTournamentsList";
import {ProfileJurySubmissionsList} from "./components/ProfileJurySubmissionsList.tsx";
import {ProfileCertificates} from "./components/ProfileCertificates.tsx";

export const ProfilePage = () => {
    const {t} = useTranslation();
    const {
        user, teams, tournaments, loading,
        isEditing, setIsEditing, editName, setEditName,
        isSaving, handleSaveProfile, cancelEditing,
        myCertificates,
        setMyPage, myPage, myTotalPages, loadingMy, downloadCertificate
    } = useProfile();
    const role = user?.role;

    if (loading) return (
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
            <CircularProgress/>
        </Box>
    );

    if (!user) return (
        <Typography variant="h6" align="center" sx={{mt: 10}}>
            {t("profile.error_loading")}
        </Typography>
    );

    return (
        <Box sx={{pb: 6, pt: 1}}>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{mb: 4}}>
                {t("profile.title")}
            </Typography>

            <Grid container spacing={4}>
                <Grid size={{xs: 12, md: (role === "USER" ? 4 : role === "JURY" || role === "ADMIN" ? 6 : 12)}}>
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

                {role === "USER" &&
                    <Grid size={{xs: 12, md: 4}}>
                        <ProfileTeamsList teams={teams}/>
                    </Grid>
                }

                {role !== "JURY" &&
                    <Grid size={{xs: 12, md: role === "ADMIN" ? 6 : 4}}>
                        <ProfileTournamentsList tournaments={tournaments}/>
                    </Grid>
                }

                {role === "JURY" &&
                    <Grid size={{xs: 12, md: 6}}>
                        <ProfileJurySubmissionsList/>
                    </Grid>
                }

                {role !== "JURY" &&
                    <Grid size={{xs: 12}}>
                        <ProfileCertificates
                            loadingMy={loadingMy}
                            role={user.role}
                            myCertificates={myCertificates}
                            downloadCertificate={downloadCertificate}
                            myPage={myPage}
                            setMyPage={setMyPage}
                            myTotalPages={myTotalPages}/>
                    </Grid>
                }
            </Grid>
        </Box>
    );
};