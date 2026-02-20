import {type SetStateAction, useState} from "react";
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
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import logo from "../../assets/logo.png";
import {Link as RouterLink} from "react-router-dom";

export const AppHeader = () => {
    // State for managing the profile dropdown menu
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: { currentTarget: SetStateAction<null>; }) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: "background.paper",
                color: "text.primary",
                borderBottom: "1px solid #e0e0e0",
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ display: "flex", alignItems: "center" }}>

                    <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                        <Box
                            component={RouterLink}
                            to="/"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <Box
                                component="img"
                                src={logo}
                                alt="Star for Life"
                                sx={{ height: 50 }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
                        <Button color="inherit">Турніри</Button>
                        <Button color="inherit">Команди</Button>
                    </Box>

                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "secondary.main",
                                color: "#000",
                                px: 3,
                            }}
                        >
                            Підтримати
                        </Button>

                        <IconButton
                            onClick={handleClick}
                            size="small"
                            sx={{ ml: 1 }}
                            aria-controls={open ? 'profile-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                        >
                            <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
                                <PersonIcon />
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </Container>

            <Menu
                anchorEl={anchorEl}
                id="profile-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                        mt: 1.5,
                        minWidth: 180,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        // Little arrow pointing to the avatar
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 18,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem component={RouterLink} to="/profile">
                    <ListItemIcon>
                        <PersonIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    Профіль
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => {
                    // Add your logout logic here
                    console.log("User logged out");
                }}>
                    <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                    </ListItemIcon>
                    Вийти
                </MenuItem>
            </Menu>
        </AppBar>
    );
};