import React, {useEffect, useState} from 'react';
import {useAuth} from './useAuth.tsx';
import AuthService from '../services/auth/AuthService';
import {Box, CircularProgress} from '@mui/material';

const AuthInit: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            if (!isAuthenticated()) {
                try {
                    // Try to silently refresh the token in the background
                    await AuthService.refresh();
                } catch (e) {
                    // If it fails, they are simply a guest. Do nothing.
                    console.log("No valid session found. User is a guest.");
                }
            }
            // FINALLY block equivalent - always load the app!
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