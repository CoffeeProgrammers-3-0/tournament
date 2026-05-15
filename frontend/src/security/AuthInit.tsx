import React, {useEffect, useState} from 'react';
import {Box, CircularProgress} from '@mui/material';
import AuthService from '../services/auth/AuthService';

const AuthInit: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath === '/callback') {
            setIsLoaded(true);
            return;
        }

        const initAuth = async () => {
            const hasCookies = document.cookie.includes('refreshToken') && document.cookie.includes('accessToken');

            if (!hasCookies) {
                try {
                    await AuthService.refresh();
                } catch (e) {
                    console.log("No valid session found. User is a guest.");
                }
            }
            setIsLoaded(true);
        };

        initAuth();
    }, []);

    if (!isLoaded) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return children;
};

export default AuthInit;