import {Box, Container, Grid, IconButton, Link, Typography,} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import logo from "../../assets/logo.png";

export const AppFooter = () => {
    return (
        <Box component="footer" sx={{
            backgroundColor: "#ffffff",
            mt: "auto",
            borderTop: "1px solid",
            borderColor: "divider",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
            position: "sticky",
            bottom: 0,
            zIndex: 10,
        }}>
            <Container maxWidth="lg" sx={{ pt: 6, pb: 4 }}>
                <Grid container spacing={4} justifyContent="center">
                    <Grid size={{ xs: 12 }} sx={{ textAlign: "center", mb: 2 }}>
                        <Box
                            component="img"
                            src={logo}
                            alt="Star for Life"
                            sx={{ height: 60 }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: "center" }}>
                        <Typography fontWeight={700} color="primary" gutterBottom>
                            Турніри
                        </Typography>
                        <Link display="block" underline="hover" sx={{ cursor: "pointer", mb: 1, color: "text.secondary" }}>
                            Доступні
                        </Link>
                        <Link display="block" underline="hover" sx={{ cursor: "pointer", color: "text.secondary" }}>
                            Мої
                        </Link>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: "center" }}>
                        <Typography fontWeight={700} color="primary" gutterBottom>
                            Команди
                        </Typography>
                        <Link display="block" underline="hover" sx={{ cursor: "pointer", color: "text.secondary" }}>
                            Мої
                        </Link>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: "center" }}>
                        <Typography fontWeight={700} color="primary" gutterBottom>
                            Контакти
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                            team@starforlife.org.ua
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Засновано: 30.01.2023
                        </Typography>

                        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
                            <IconButton color="primary" size="small">
                                <InstagramIcon />
                            </IconButton>
                            <IconButton color="primary" size="small">
                                <FacebookIcon />
                            </IconButton>
                            <IconButton color="primary" size="small">
                                <LinkedInIcon />
                            </IconButton>
                            <IconButton color="primary" size="small">
                                <YouTubeIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            <Box
                sx={{
                    backgroundColor: "primary.main",
                    color: "white",
                    py: 1.5,
                    textAlign: "center",
                }}
            >
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    © 2026 Star for Life Ukraine | Умови використання | Політика конфіденційності
                </Typography>
            </Box>
        </Box>
    );
};