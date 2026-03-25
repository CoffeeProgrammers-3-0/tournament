import {type MouseEvent, useState} from "react";
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Container,
    Divider,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from "@mui/material";
import {useTranslation} from "react-i18next";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import HistoryIcon from "@mui/icons-material/History";
import LanguageIcon from "@mui/icons-material/Language";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIcon from "@mui/icons-material/Assignment";

import logo from "../../assets/logo.png";
import {Link as RouterLink} from "react-router-dom";
import {useLanguage} from "../../i18n/useLanguage.ts";
import Cookies from "js-cookie";
import AuthService from "../../services/auth/AuthService.ts";

// Визначення ролей для зручності
type role = 'ADMIN' | 'JURY' | 'USER' | null;

export const AppHeader = () => {
    const { t } = useTranslation();
    const { language, changeLanguage } = useLanguage();

    // Отримання статусу авторизації та ролі
    const isLoggedIn = Cookies.get("userId") !== undefined;
    const role = Cookies.get("role") as role || 'USER'; // Замініть на вашу логіку

    const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
    const [tournamentsAnchorEl, setTournamentsAnchorEl] = useState<null | HTMLElement>(null);
    const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);

    const handleProfileClick = (e: MouseEvent<HTMLElement>) => setProfileAnchorEl(e.currentTarget);
    const handleTournamentsClick = (e: MouseEvent<HTMLElement>) => setTournamentsAnchorEl(e.currentTarget);
    const handleLangClick = (e: MouseEvent<HTMLElement>) => setLangAnchorEl(e.currentTarget);

    const handleClose = () => {
        setProfileAnchorEl(null);
        setTournamentsAnchorEl(null);
        setLangAnchorEl(null);
    };

    const handleLangSelect = (lang: string) => {
        changeLanguage(lang);
        handleClose();
    };

    return (
        <AppBar position="static" elevation={0} sx={{ backgroundColor: "background.paper", color: "text.primary", borderBottom: "1px solid #e0e0e0" }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ display: "flex", alignItems: "center" }}>

                    {/* LEFT: Logo */}
                    <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                        <Box component={RouterLink} to="/" sx={{ display: "flex", alignItems: "center" }}>
                            <Box component="img" src={logo} alt="Star for Life" sx={{ height: 50 }} />
                        </Box>
                    </Box>

                    {/* CENTER: Navigation (Dynamic based on Role) */}
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>

                        {/* 1. TOURNAMENTS (Visible for Admin & User) */}
                        {(role === 'ADMIN' || role === 'USER') && (
                            <Button
                                color="inherit"
                                onClick={handleTournamentsClick}
                                endIcon={<KeyboardArrowDownIcon />}
                                sx={{ fontWeight: tournamentsAnchorEl ? 700 : 500, textTransform: "none" }}
                            >
                                {t("header.tournaments")}
                            </Button>
                        )}

                        {/* 2. TEAMS (Admin: All teams, User: My Team) */}
                        {isLoggedIn && (role === 'ADMIN' || role === 'USER') && (
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to={role === 'ADMIN' ? "/admin/teams" : "/my-team"}
                                sx={{ textTransform: "none" }}
                                startIcon={<GroupsIcon sx={{ opacity: 0.7 }} />}
                            >
                                {role === 'ADMIN' ? t("header.allTeams") : t("header.myTeam")}
                            </Button>
                        )}

                        {/* 3. JURY SPECIFIC: My Submissions */}
                        {isLoggedIn && role === 'JURY' && (
                            <Button
                                color="primary"
                                variant="text"
                                component={RouterLink}
                                to="/jury/submissions"
                                sx={{ textTransform: "none", fontWeight: 700 }}
                                startIcon={<AssignmentIcon />}
                            >
                                {t("header.mySubmissions")}
                            </Button>
                        )}

                        {/* 4. ADMIN SPECIFIC: Management */}
                        {isLoggedIn && role === 'ADMIN' && (
                            <Button
                                color="primary"
                                component={RouterLink}
                                to="/admin/jury/create"
                                sx={{ textTransform: "none", fontWeight: 600 }}
                                startIcon={<AdminPanelSettingsIcon />}
                            >
                                {t("header.adminPanel")}
                            </Button>
                        )}
                    </Box>

                    {/* RIGHT: Actions */}
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5 }}>
                        <Button
                            href="https://www.sflua.org/donate-1"
                            target="_blank"
                            variant="contained"
                            sx={{ backgroundColor: "secondary.main", color: "#000", px: 3, fontWeight: 600, borderRadius: "8px", display: { xs: 'none', md: 'inline-flex' } }}
                        >
                            {t("header.support")}
                        </Button>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: "center" }} />

                        <Button
                            onClick={handleLangClick}
                            startIcon={<LanguageIcon sx={{ fontSize: 20 }} />}
                            sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", minWidth: 60 }}
                        >
                            {language}
                        </Button>

                        {isLoggedIn ? (
                            <IconButton onClick={handleProfileClick} size="small">
                                <Avatar sx={{
                                    width: 40, height: 40,
                                    bgcolor: role === 'ADMIN' ? "error.main" : "primary.main"
                                }}>
                                    {role === 'ADMIN' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                                </Avatar>
                            </IconButton>
                        ) : (
                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="outlined"
                                color="primary"
                                startIcon={<LoginIcon />}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
                            >
                                {t("header.login")}
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>

            {/* Menu: Languages */}
            <Menu
                anchorEl={langAnchorEl}
                open={Boolean(langAnchorEl)}
                onClose={handleClose}
                PaperProps={{ elevation: 0, sx: { filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))', mt: 1, minWidth: 150, borderRadius: "12px" } }}
            >
                <MenuItem onClick={() => handleLangSelect("uk")}>🇺🇦 {t("languages.uk")}</MenuItem>
                <MenuItem onClick={() => handleLangSelect("en")}>🇺🇸 {t("languages.en")}</MenuItem>
            </Menu>

            {/* Menu: Tournaments */}
            <Menu
                anchorEl={tournamentsAnchorEl}
                open={Boolean(tournamentsAnchorEl)}
                onClose={handleClose}
                PaperProps={{ elevation: 0, sx: { filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))', mt: 1.5, minWidth: 220, borderRadius: "12px" } }}
                transformOrigin={{ horizontal: 'center', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
            >
                <MenuItem component={RouterLink} to="/tournaments" onClick={handleClose}>
                    <ListItemIcon><EmojiEventsIcon fontSize="small" color="primary" /></ListItemIcon>
                    {role === 'ADMIN' ? t("header.manageTournaments") : t("header.availableTournaments")}
                </MenuItem>

                {isLoggedIn && role === 'USER' && [
                    <MenuItem key="current" component={RouterLink} to="/tournaments?tab=1" onClick={handleClose}>
                        <ListItemIcon><PlayCircleOutlineIcon fontSize="small" color="warning" /></ListItemIcon>
                        {t("header.myCurrentTournaments")}
                    </MenuItem>,
                    <Divider key="divider" />,
                    <MenuItem key="history" component={RouterLink} to="/tournaments?tab=2" onClick={handleClose}>
                        <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                        {t("header.history")}
                    </MenuItem>
                ]}
            </Menu>

            {/* Menu: Profile */}
            {isLoggedIn && (
                <Menu
                    anchorEl={profileAnchorEl}
                    open={Boolean(profileAnchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))', mt: 1.5, minWidth: 200, borderRadius: "12px",
                            '&::before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 18, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 }
                        }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={700}>{t("header.role")}: {role}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                        <ListItemIcon><PersonIcon fontSize="small" color="primary" /></ListItemIcon>
                        {t("header.profile")}
                    </MenuItem>
                    <MenuItem onClick={() => { handleClose(); AuthService.logout()}}>
                        <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                        {t("header.logout")}
                    </MenuItem>
                </Menu>
            )}
        </AppBar>
    );
};