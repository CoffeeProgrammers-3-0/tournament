import {type MouseEvent, useCallback, useEffect, useState} from "react";
import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from "@mui/material";
import {useTranslation} from "react-i18next";
import MenuIcon from "@mui/icons-material/Menu";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FavoriteIcon from "@mui/icons-material/Favorite";

import logo from "../../assets/logo.png";
import {Link as RouterLink} from "react-router-dom";
import {useLanguage} from "../../i18n/useLanguage.ts";
import Cookies from "js-cookie";
import AuthService from "../../services/auth/AuthService.ts";

import NotificationsIcon from "@mui/icons-material/Notifications";
import {notificationService} from "../../services/impl/NotificationService.ts";

type role = 'ADMIN' | 'JURY' | 'USER' | null;

export const AppHeader = () => {
    const { t } = useTranslation();
    const { language, changeLanguage } = useLanguage();

    const isLoggedIn = Cookies.get("userId") !== undefined;
    const role = (Cookies.get("role") as role) || 'USER';

    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
    const [tournamentsAnchorEl, setTournamentsAnchorEl] = useState<null | HTMLElement>(null);
    const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleProfileClick = (e: MouseEvent<HTMLElement>) => setProfileAnchorEl(e.currentTarget);
    const handleTournamentsClick = (e: MouseEvent<HTMLElement>) => setTournamentsAnchorEl(e.currentTarget);
    const handleLangClick = (e: MouseEvent<HTMLElement>) => setLangAnchorEl(e.currentTarget);

    const [unseenCount, setUnseenCount] = useState<number>(0);

    const handleClose = () => {
        setProfileAnchorEl(null);
        setTournamentsAnchorEl(null);
        setLangAnchorEl(null);
    };

    const handleLangSelect = (lang: string) => {
        changeLanguage(lang);
        handleClose();
    };

    const fetchUnseenCount = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const response = await notificationService.getUnseenCount();
            // response зазвичай приходить як { value: number } або просто число залежно від вашого LongDto
            setUnseenCount(typeof response === 'object' ? (response as any).value : response);
        } catch (error) {
            console.error("Failed to fetch unseen count", error);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchUnseenCount();
        const interval = setInterval(fetchUnseenCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnseenCount]);

    // Контент бокового меню (для мобілок)
    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
            <Box component="img" src={logo} alt="Star for Life" sx={{ height: 40, mb: 2 }} />
            <Divider />
            <List>
                {(role === 'ADMIN' || role === 'USER') && (
                    <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to={role === 'ADMIN' ? "/tournaments?tab=1&filter=ALL" : "/tournaments?filter=AVAILABLE"}>
                            <ListItemIcon><EmojiEventsIcon color="primary" /></ListItemIcon>
                            <ListItemText primary={t("header.tournaments")} />
                        </ListItemButton>
                    </ListItem>
                )}
                {isLoggedIn && (role === 'ADMIN' || role === 'USER') && (
                    <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to={"/teams"}>
                            <ListItemIcon><GroupsIcon /></ListItemIcon>
                            <ListItemText primary={role === 'ADMIN' ? t("header.allTeams") : t("header.myTeam")} />
                        </ListItemButton>
                    </ListItem>
                )}
                {isLoggedIn && role === 'JURY' && (
                    <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to="/jury/submissions">
                            <ListItemIcon><AssignmentIcon color="primary" /></ListItemIcon>
                            <ListItemText primary={t("header.mySubmissions")} />
                        </ListItemButton>
                    </ListItem>
                )}
                {isLoggedIn && role === 'ADMIN' && (
                    <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to="/admin/jury/managment">
                            <ListItemIcon><AdminPanelSettingsIcon color="primary" /></ListItemIcon>
                            <ListItemText primary={t("header.adminPanel")} />
                        </ListItemButton>
                    </ListItem>
                )}
                {isLoggedIn && (
                    <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to="/notifications">
                            <Badge badgeContent={unseenCount} color="error">
                                <NotificationsIcon color="primary" />
                            </Badge>
                            <ListItemText primary={t("header.notifications") || "Notifications"} />
                        </ListItemButton>
                    </ListItem>
                )}
                <Divider sx={{ my: 1 }} />
                <ListItem disablePadding>
                    <ListItemButton href="https://www.sflua.org/donate-1" target="_blank">
                        <ListItemIcon><FavoriteIcon color="error" /></ListItemIcon>
                        <ListItemText primary={t("header.support")} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <AppBar position="sticky" elevation={0} sx={{ backgroundColor: "background.paper", color: "text.primary", borderBottom: "1px solid #e0e0e0" }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ display: "flex", justifyContent: "space-between" }}>

                    {/* MOBILE: Burger Button */}
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* LOGO (Centered on mobile, Left on desktop) */}
                    <Box component={RouterLink} to="/" sx={{ display: "flex", alignItems: "center", position: { xs: 'absolute', md: 'static' }, left: { xs: '50%' }, transform: { xs: 'translateX(-50%)', md: 'none' } }}>
                        <Box component="img" src={logo} alt="Star for Life" sx={{ height: { xs: 35, md: 45 } }} />
                    </Box>

                    {/* DESKTOP NAVIGATION */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: "center" }}>
                        {(role === 'ADMIN' || role === 'USER') && (
                            <Button color="inherit" onClick={handleTournamentsClick} endIcon={<KeyboardArrowDownIcon />} sx={{ textTransform: "none" }}>
                                {t("header.tournaments")}
                            </Button>
                        )}
                        {isLoggedIn && (role === 'ADMIN' || role === 'USER') && (
                            <Button color="inherit" component={RouterLink} to={"/teams"} sx={{ textTransform: "none" }} startIcon={<GroupsIcon sx={{ opacity: 0.7 }} />}>
                                {role === 'ADMIN' ? t("header.allTeams") : t("header.myTeam")}
                            </Button>
                        )}
                        {isLoggedIn && role === 'JURY' && (
                            <Button color="primary" variant="text" component={RouterLink} to="/jury/submissions" sx={{ textTransform: "none", fontWeight: 700 }} startIcon={<AssignmentIcon />}>
                                {t("header.mySubmissions")}
                            </Button>
                        )}
                        {isLoggedIn && role === 'ADMIN' && (
                            <Button color="primary" component={RouterLink} to="/admin/jury/managment" sx={{ textTransform: "none", fontWeight: 600 }} startIcon={<AdminPanelSettingsIcon />}>
                                {t("header.adminPanel")}
                            </Button>
                        )}
                    </Box>

                    {/* RIGHT ACTIONS (Language, Donate, Profile) */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1.5 } }}>
                        <Button
                            href="https://www.sflua.org/donate-1"
                            target="_blank"
                            variant="contained"
                            size="small"
                            sx={{ backgroundColor: "secondary.main", color: "#000", fontWeight: 600, borderRadius: "8px", display: { xs: 'none', lg: 'inline-flex' } }}
                        >
                            {t("header.support")}
                        </Button>

                        <Button onClick={handleLangClick} sx={{ color: "text.secondary", fontWeight: 700, minWidth: { xs: 40, md: 60 } }}>
                            {language.toUpperCase()}
                        </Button>

                        {/* НОВА ІКОНКА СПОВІЩЕНЬ */}
                        {isLoggedIn && (
                            <IconButton
                                component={RouterLink}
                                to="/notifications"
                                sx={{ color: "text.secondary" }}
                            >
                                <Badge
                                    badgeContent={unseenCount}
                                    color="error"
                                    max={99}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            fontSize: '0.65rem',
                                            height: 16,
                                            minWidth: 16,
                                            fontWeight: 700
                                        }
                                    }}
                                >
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        )}

                        {isLoggedIn ? (
                            <IconButton onClick={handleProfileClick} size="small">
                                <Avatar sx={{ width: 35, height: 35, bgcolor: role === 'ADMIN' ? "error.main" : "primary.main" }}>
                                    {role === 'ADMIN' ? <AdminPanelSettingsIcon sx={{ fontSize: 20 }} /> : <PersonIcon sx={{ fontSize: 20 }} />}
                                </Avatar>
                            </IconButton>
                        ) : (
                            <IconButton component={RouterLink} to="/login" color="primary">
                                <LoginIcon />
                            </IconButton>
                        )}
                    </Box>
                </Toolbar>
            </Container>

            {/* MOBILE DRAWER */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260 } }}
            >
                {drawer}
            </Drawer>

            {/* DROPDOWN MENUS (Tournaments, Lang, Profile) - Same as before but with slightly better mobile spacing */}
            <Menu anchorEl={langAnchorEl} open={Boolean(langAnchorEl)} onClose={handleClose}>
                <MenuItem onClick={() => handleLangSelect("uk")}>🇺🇦 УКР</MenuItem>
                <MenuItem onClick={() => handleLangSelect("en")}>🇺🇸 ENG</MenuItem>
            </Menu>

            <Menu anchorEl={tournamentsAnchorEl} open={Boolean(tournamentsAnchorEl)} onClose={handleClose}>
                <MenuItem component={RouterLink} to={role === 'ADMIN' ? "/tournaments?tab=1&filter=ALL" : "/tournaments?filter=AVAILABLE"} onClick={handleClose}>
                    <ListItemIcon><EmojiEventsIcon fontSize="small" /></ListItemIcon>
                    {role === 'ADMIN' ? t("header.manageTournaments") : t("header.availableTournaments")}
                </MenuItem>
                {isLoggedIn && role === 'USER' && [
                    <MenuItem key="active" component={RouterLink} to="/tournaments?filter=ACTIVE" onClick={handleClose}>
                        <ListItemText primary={t("header.myCurrentTournaments")} />
                    </MenuItem>,
                    <MenuItem key="hist" component={RouterLink} to="/tournaments?filter=HISTORY" onClick={handleClose}>
                        <ListItemText primary={t("header.history")} />
                    </MenuItem>
                ]}
            </Menu>

            {isLoggedIn && (
                <Menu anchorEl={profileAnchorEl} open={Boolean(profileAnchorEl)} onClose={handleClose}>
                    <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                        {t("header.profile")}
                    </MenuItem>
                    <MenuItem onClick={() => { handleClose(); AuthService.logout(); }}>
                        <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                        <Typography color="error">{t("header.logout")}</Typography>
                    </MenuItem>
                </Menu>
            )}
        </AppBar>
    );
};