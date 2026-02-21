import {Box, Container, Grid, IconButton, Link, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import logo from "../../assets/logo.png";

export const AppFooter = () => {
    const { t } = useTranslation();

    return (
        <Box component="footer" sx={{
            backgroundColor: "#ffffff",
            mt: "auto",
            borderTop: "1px solid",
            borderColor: "divider",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
            zIndex: 10,
        }}>
            <Container maxWidth="lg" sx={{ pt: 6, pb: 4 }}>
                <Grid container spacing={4} justifyContent="center">

                    {/* Centered Logo Row */}
                    <Grid size={{xs: 12}} sx={{ textAlign: "center", mb: 2 }}>
                        <Box component="img" src={logo} alt="Star for Life" sx={{ height: 60 }} />
                    </Grid>

                    {/* Columns centered inside */}
                    <Grid size={{xs: 12, md: 4}} sx={{ textAlign: "center" }}>
                        <Typography fontWeight={700} color="primary" gutterBottom>
                            {t("footer.tournaments")}
                        </Typography>
                        <Link display="block" underline="hover" sx={{ cursor: "pointer", mb: 1, color: "text.secondary" }}>
                            {t("footer.available")}
                        </Link>
                        <Link display="block" underline="hover" sx={{ cursor: "pointer", color: "text.secondary" }}>
                            {t("footer.myTournaments")}
                        </Link>
                    </Grid>

                    <Grid size={{xs: 12, md: 4}} sx={{ textAlign: "center" }}>
                        <Typography fontWeight={700} color="primary" gutterBottom>
                            {t("footer.teams")}
                        </Typography>
                        <Link display="block" underline="hover" sx={{ cursor: "pointer", color: "text.secondary" }}>
                            {t("footer.myTeams")}
                        </Link>
                    </Grid>

                    <Grid size={{xs: 12, md: 4}} sx={{ textAlign: "center" }}>
                        <Typography fontWeight={700} color="primary" gutterBottom>
                            {t("footer.contacts")}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                            team@starforlife.org.ua
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {t("footer.founded")}
                        </Typography>

                        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
                            <IconButton color="primary" size="small"><InstagramIcon /></IconButton>
                            <IconButton color="primary" size="small"><FacebookIcon /></IconButton>
                            <IconButton color="primary" size="small"><LinkedInIcon /></IconButton>
                            <IconButton color="primary" size="small"><YouTubeIcon /></IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            <Box sx={{ backgroundColor: "primary.main", color: "white", py: 1.5, textAlign: "center" }}>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {t("footer.rights")} | {t("footer.terms")} | {t("footer.privacy")}
                </Typography>
            </Box>
        </Box>
    );
};