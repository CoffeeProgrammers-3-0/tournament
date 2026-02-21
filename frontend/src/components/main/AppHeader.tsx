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
} from "@mui/material";
import {useTranslation} from "react-i18next"; // Імпортуємо стандартний хук
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import HistoryIcon from "@mui/icons-material/History";
import LanguageIcon from "@mui/icons-material/Language";
import logo from "../../assets/logo.png";
import {Link as RouterLink} from "react-router-dom";
import {useLanguage} from "../../i18n/useLanguage.ts";

export const AppHeader = () => {
    const { t } = useTranslation(); // Функція для перекладу
    const { language, changeLanguage } = useLanguage();

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

                    {/* CENTER: Navigation */}
                    <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
                        <Button
                            color="inherit"
                            onClick={handleTournamentsClick}
                            endIcon={<KeyboardArrowDownIcon />}
                            sx={{ fontWeight: tournamentsAnchorEl ? 700 : 500, textTransform: "none" }}
                        >
                            {t("header.tournaments")}
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/teams" sx={{ textTransform: "none" }}>
                            {t("header.teams")}
                        </Button>
                    </Box>

                    {/* RIGHT: Actions */}
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5 }}>
                        <Button component={RouterLink} to="https://www.sflua.org/donate-1" variant="contained" sx={{ backgroundColor: "secondary.main", color: "#000", px: 3, fontWeight: 600, borderRadius: "8px" }}>
                            {t("header.support")}
                        </Button>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: "center" }} />

                        {/* Language Switcher */}
                        <Button
                            onClick={handleLangClick}
                            startIcon={<LanguageIcon sx={{ fontSize: 20 }} />}
                            sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", minWidth: 60 }}
                        >
                            {language}
                        </Button>

                        <IconButton onClick={handleProfileClick} size="small">
                            <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
                                <PersonIcon />
                            </Avatar>
                        </IconButton>
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
                <MenuItem onClick={() => handleLangSelect("uk")} selected={language === "uk"}>
                    🇺🇦 {t("languages.uk")}
                </MenuItem>
                <MenuItem onClick={() => handleLangSelect("en")} selected={language === "en"}>
                    🇺🇸 {t("languages.en")}
                </MenuItem>
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
                <MenuItem component={RouterLink} to="/tournaments?tab=0" onClick={handleClose}>
                    <ListItemIcon><EmojiEventsIcon fontSize="small" color="primary" /></ListItemIcon>
                    {t("header.availableTournaments")}
                </MenuItem>
                <MenuItem component={RouterLink} to="/tournaments?tab=1" onClick={handleClose}>
                    <ListItemIcon><PlayCircleOutlineIcon fontSize="small" color="warning" /></ListItemIcon>
                    {t("header.myCurrentTournaments")}
                </MenuItem>
                <Divider />
                <MenuItem component={RouterLink} to="/tournaments?tab=2" onClick={handleClose}>
                    <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                    {t("header.history")}
                </MenuItem>
            </Menu>

            {/* Menu: Profile */}
            <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))', mt: 1.5, minWidth: 180, borderRadius: "12px",
                        '&::before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 18, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 }
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                    <ListItemIcon><PersonIcon fontSize="small" color="primary" /></ListItemIcon>
                    {t("header.profile")}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                    <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                    {t("header.logout")}
                </MenuItem>
            </Menu>
        </AppBar>
    );
};