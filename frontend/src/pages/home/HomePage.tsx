import {Box, Typography} from "@mui/material";

const HomePage = () => {
    return (
        <Box textAlign="center">
            <Typography variant="h3" fontWeight={600} gutterBottom>
                Home Page
            </Typography>

            <Typography variant="body1" color="text.secondary">
                This is a simple starting point.
            </Typography>
        </Box>
    );
};

export default HomePage;