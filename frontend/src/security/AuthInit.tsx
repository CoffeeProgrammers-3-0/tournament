// security/AuthInit.tsx
import React, {useEffect, useState} from 'react';
import {useAuth} from './useAuth.tsx';
import AuthService from '../services/auth/AuthService';
import {Box, CircularProgress} from '@mui/material';

const AuthInit: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            // Якщо ми не авторизовані в стейті, пробуємо рефрешнути токен
            if (!isAuthenticated()) {
                try {
                    // AuthService.refresh() має повертати проміс або оновлювати стейт
                    await AuthService.refresh();
                } catch (e) {
                    console.log("User is guest");
                }
            }
            setIsLoaded(true);
        };

        initAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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