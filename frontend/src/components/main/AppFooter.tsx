import {Box, Container, Grid, IconButton, Link, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {Link as RouterLink} from "react-router-dom";
import Cookies from "js-cookie";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import logo from "../../assets/logo.png";

type role = 'ADMIN' | 'JURY' | 'USER' | null;

export const AppFooter = () => {
    const { t } = useTranslation();

    const isLoggedIn = Cookies.get("userId") !== undefined;
    const role = (Cookies.get("role") as role) || 'USER';

    const mdColSize = role === 'JURY' ? 4 : 3;

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

                    <Grid size={{xs: 12, md: mdColSize}} sx={{ textAlign: { xs: "center", md: "left" } }}>
                        <Box component={RouterLink} to="/" sx={{ display: "inline-block", mb: 2 }}>
                            <Box component="img" src={logo} alt="Star for Life" sx={{ height: 50 }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250, mx: { xs: "auto", md: 0 } }}>
                            {t("footer.description", "Цифрова платформа для проведення хакатонів та конкурсів.")}
                        </Typography>
                    </Grid>

                    {(role === 'ADMIN' || role === 'USER') && (
                        <Grid size={{xs: 6, md: mdColSize}} sx={{ textAlign: "center" }}>
                            <Typography fontWeight={800} color="text.primary" sx={{ mb: 2, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>
                                {t("header.tournaments")}
                            </Typography>

                            {role === 'ADMIN' ? (
                                <>
                                    <Link component={RouterLink} to="/tournaments?tab=1&filter=ALL" display="block" underline="hover" sx={{ mb: 1, color: "text.secondary", fontSize: "0.875rem" }}>
                                        {t("header.manageTournaments")}
                                    </Link>
                                    <Link component={RouterLink} to="/tournaments?filter=AVAILABLE" display="block" underline="hover" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                                        {t("header.availableTournaments")}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link component={RouterLink} to="/tournaments?filter=AVAILABLE" display="block" underline="hover" sx={{ mb: 1, color: "text.secondary", fontSize: "0.875rem" }}>
                                        {t("header.availableTournaments")}
                                    </Link>
                                    {isLoggedIn && (
                                        <>
                                            <Link component={RouterLink} to="/tournaments?filter=ACTIVE" display="block" underline="hover" sx={{ mb: 1, color: "text.secondary", fontSize: "0.875rem" }}>
                                                {t("header.myCurrentTournaments")}
                                            </Link>
                                            <Link component={RouterLink} to="/tournaments?filter=HISTORY" display="block" underline="hover" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                                                {t("header.history")}
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}
                        </Grid>
                    )}

                    <Grid size={{xs: role === 'JURY' ? 12 : 6, md: mdColSize}} sx={{ textAlign: "center" }}>
                        <Typography fontWeight={800} color="text.primary" sx={{ mb: 2, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>
                            {role === 'JURY' ? t("header.mySubmissions") : (role === 'ADMIN' ? t("header.adminPanel") : t("footer.teams", "Команди"))}
                        </Typography>

                        {role === 'ADMIN' && (
                            <>
                                <Link component={RouterLink} to="/admin/teams" display="block" underline="hover" sx={{ mb: 1, color: "text.secondary", fontSize: "0.875rem" }}>
                                    {t("header.allTeams")}
                                </Link>
                                <Link component={RouterLink} to="/admin/jury/managment" display="block" underline="hover" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                                    {t("header.adminPanel")}
                                </Link>
                            </>
                        )}

                        {role === 'USER' && (
                            <Link component={RouterLink} to={isLoggedIn ? "/teams" : "/login"} display="block" underline="hover" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                                {isLoggedIn ? t("header.myTeam") : t("header.login")}
                            </Link>
                        )}

                        {role === 'JURY' && isLoggedIn && (
                            <Link component={RouterLink} to="/jury/submissions" display="block" underline="hover" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                                {t("header.mySubmissions")}
                            </Link>
                        )}
                    </Grid>

                    <Grid size={{xs: 12, md: mdColSize}} sx={{ textAlign: { xs: "center", md: "right" } }}>
                        <Typography fontWeight={800} color="text.primary" sx={{ mb: 2, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>
                            {t("footer.contacts")}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: "primary.main", fontWeight: 600 }}>
                            team@starforlife.org.ua
                        </Typography>

                        <Box sx={{ mt: 2, display: "flex", justifyContent: { xs: "center", md: "flex-end" }, gap: 1 }}>
                            <IconButton sx={{ bgcolor: "grey.100", '&:hover': { bgcolor: "primary.light", color: "white" } }} size="small" href="https://www.instagram.com/starforlifeukraine" target="_blank">
                                <InstagramIcon fontSize="small" />
                            </IconButton>
                            <IconButton sx={{ bgcolor: "grey.100", '&:hover': { bgcolor: "primary.light", color: "white" } }} size="small" href="https://www.facebook.com/starforlifeua" target="_blank">
                                <FacebookIcon fontSize="small" />
                            </IconButton>
                            <IconButton sx={{ bgcolor: "grey.100", '&:hover': { bgcolor: "primary.light", color: "white" } }} size="small" href="https://www.linkedin.com/company/starforlifeua/" target="_blank">
                                <LinkedInIcon fontSize="small" />
                            </IconButton>
                            <IconButton sx={{ bgcolor: "grey.100", '&:hover': { bgcolor: "primary.light", color: "white" } }} size="small" href="https://www.youtube.com/@starforlifeua" target="_blank">
                                <YouTubeIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            <Box sx={{ backgroundColor: "primary.main", color: "white", py: 2 }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            © 2026 Star for Life Ukraine. {t("footer.rights")}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 3 }}>
                            <Link component={RouterLink} to="/terms" color="inherit" underline="none" sx={{ fontSize: "0.75rem", opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                {t("footer.terms")}
                            </Link>
                            <Link component={RouterLink} to="/privacy" color="inherit" underline="none" sx={{ fontSize: "0.75rem", opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                {t("footer.privacy")}
                            </Link>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};