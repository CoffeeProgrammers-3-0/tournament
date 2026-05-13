import React, {useEffect, useState} from 'react';
import {Box, CircularProgress} from '@mui/material';
import AuthService from '../services/auth/AuthService';

const AuthInit: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // 1. IMPORTANT: Detect if we are on the callback page
        const currentPath = window.location.pathname;
        if (currentPath === '/callback') {
            setIsLoaded(true); // Don't run auth checks, just let the app load
            return;
        }

        const initAuth = async () => {
            // Check if we already have the cookies (without redirecting)
            // Replace 'userId' with whatever check 'isAuthenticated' uses
            const hasCookies = document.cookie.includes('refreshToken') && document.cookie.includes('accessToken');

            if (!hasCookies) {
                try {
                    // Try to silently refresh in the background
                    await AuthService.refresh();
                } catch (e) {
                    console.log("No valid session found. User is a guest.");
                }
            }
            // Always set to loaded so the UI renders
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