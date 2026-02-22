import {Box, Container, Grid, IconButton, Link, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {Link as RouterLink} from "react-router-dom";
import Cookies from "js-cookie";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import logo from "../../assets/logo.png";

export const AppFooter = () => {
    const { t } = useTranslation();

    // Перевірка авторизації
    const isLoggedIn = Cookies.get("userId") !== undefined;

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

                    {/* Logo Row */}
                    <Grid size={{xs: 12}} sx={{ textAlign: "center", mb: 2 }}>
                        <Box component={RouterLink} to="/">
                            <Box component="img" src={logo} alt="Star for Life" sx={{ height: 60 }} />
                        </Box>
                    </Grid>

                    {/* Tournaments Column */}
                    <Grid size={{xs: 12, md: 4}} sx={{ textAlign: "center" }}>
                        <Typography fontWeight={700} color="primary" gutterBottom>
                            {t("tournaments.title")}
                        </Typography>
                        <Link
                            component={RouterLink}
                            to="/tournaments?tab=0"
                            display="block"
                            underline="hover"
                            sx={{ mb: 1, color: "text.secondary" }}
                        >
                            {t("tournaments.tabs.available")}
                        </Link>
                        {/* Показуємо "Мої", тільки якщо залогінений */}
                        {isLoggedIn && (
                            <Link
                                component={RouterLink}
                                to="/tournaments?tab=1"
                                display="block"
                                underline="hover"
                                sx={{ color: "text.secondary" }}
                            >
                                {t("tournaments.tabs.my")}
                            </Link>
                        )}
                    </Grid>

                    {/* Teams Column */}
                    <Grid size={{xs: 12, md: 4}} sx={{ textAlign: "center" }}>
                        <Typography fontWeight={700} color="primary" gutterBottom>
                            {t("footer.teams")}
                        </Typography>
                        {/* Якщо залогінений — ведемо в кабінет команд, якщо ні — можемо вести на загальний опис або приховати */}
                        <Link
                            component={RouterLink}
                            to={isLoggedIn ? "/teams" : "/login"}
                            display="block"
                            underline="hover"
                            sx={{ color: "text.secondary" }}
                        >
                            {isLoggedIn ? t("footer.myTeams") : t("header.login")}
                        </Link>
                    </Grid>

                    {/* Contacts Column */}
                    <Grid size={{xs: 12, md: 4}} sx={{ textAlign: "center" }}>
                        <Typography fontWeight={700} color="primary" gutterBottom>
                            {t("footer.contacts")}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                            team@starforlife.org.ua
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
                            {t("footer.founded")}
                        </Typography>

                        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
                            <IconButton color="primary" size="small" href="https://instagram.com" target="_blank">
                                <InstagramIcon />
                            </IconButton>
                            <IconButton color="primary" size="small" href="https://facebook.com" target="_blank">
                                <FacebookIcon />
                            </IconButton>
                            <IconButton color="primary" size="small" href="https://linkedin.com" target="_blank">
                                <LinkedInIcon />
                            </IconButton>
                            <IconButton color="primary" size="small" href="https://youtube.com" target="_blank">
                                <YouTubeIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Bottom Bar */}
            <Box sx={{ backgroundColor: "primary.main", color: "white", py: 1.5, textAlign: "center" }}>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {t("footer.rights")} | {t("footer.terms")} | {t("footer.privacy")}
                </Typography>
            </Box>
        </Box>
    );
};