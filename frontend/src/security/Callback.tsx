import React, {useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import {
    Box,
    CircularProgress,
    Typography,
    Container,
    Paper
} from '@mui/material';

const Callback: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            fetch(`http://localhost:8081/api/auth/callback?code=${encodeURIComponent(code)}`, {
                method: 'GET',
                credentials: 'include',
            }).then(res => {
                if (res.ok) {
                    Cookies.get('userId');

                    const returnPath = localStorage.getItem('preLoginPath') || '/home';
                    localStorage.removeItem('preLoginPath');

                    navigate(returnPath);
                } else {
                    alert('Помилка авторизації');
                }
            });
        }
    }, [navigate]);

    return (
            <Container maxWidth="sm">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            padding: 6,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-lg)',
                            textAlign: 'center',
                            width: '100%',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    >
                        <CircularProgress
                            size={50}
                            thickness={4}
                            sx={{
                                mb: 4,
                                color: 'var(--color-surface-alt)'
                            }}
                        />

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                mb: 1.5,
                                color: 'var(--color-text)'
                            }}
                        >
                            {t('common.authenticating')}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'var(--color-muted)',
                                maxWidth: '300px'
                            }}
                        >
                            {t('common.authenticatingSubtitle')}
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        );
};

export default Callback;