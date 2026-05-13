import axios from 'axios';
import Cookies from 'js-cookie';

// Збираємо всі посилання та параметри в один конфіг
const AUTH_CONFIG = {
    KEYCLOAK_AUTH_URL: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080/auth",
    KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM || "coffee-programmers",
    CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "coffee-programmers-client",
    REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/callback`,
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"
};

class AuthService {
    private static refreshPromise: Promise<boolean> | null = null;

    static redirectToKeycloak(): void {
        const currentPath = window.location.pathname;

        const technicalRoutes = ['/callback', '/login', '/logout'];
        if (!technicalRoutes.includes(currentPath)) {
            localStorage.setItem('preLoginPath', currentPath);
        } else if (!localStorage.getItem('preLoginPath')) {
            localStorage.setItem('preLoginPath', '/home');
        }

        const loginUrl = `${AUTH_CONFIG.KEYCLOAK_AUTH_URL}/realms/${AUTH_CONFIG.KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${AUTH_CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(AUTH_CONFIG.REDIRECT_URI)}&response_type=code&scope=openid`;

        window.location.href = loginUrl;
    }

    static async logout(): Promise<void> {
        const userId = Cookies.get('userId');

        try {
            await axios.post(`${AUTH_CONFIG.API_BASE_URL}/auth/logout`, {}, {
                params: { userId },
                withCredentials: true,
            });
        } catch (e) {
            console.error("Logout failed", e);
        } finally {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            Cookies.remove('userId');

            window.location.href = '/home';
        }
    }

    static async refresh(): Promise<boolean> {
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = (async () => {
            const refreshToken = Cookies.get("refreshToken");
            const hasAccessToken = Cookies.get('accessToken') !== undefined;
            const isAuthed = Cookies.get("userId") !== undefined;

            if (!refreshToken) {
                console.log("No refresh token available");
                if (isAuthed) {
                    this.redirectToKeycloak();
                }
                return false;
            }

            const MAX_RETRIES = 3;

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    await axios.post(
                        `${AUTH_CONFIG.API_BASE_URL}/auth/refresh`,
                        {},
                        {
                            params: { refreshToken: encodeURIComponent(refreshToken) },
                            withCredentials: true,
                        }
                    );

                    console.log(`Refresh success on attempt ${attempt}`);
                    return true;

                } catch (error) {
                    console.warn(`Refresh attempt ${attempt} failed`, error);

                    if (attempt < MAX_RETRIES) {
                        await new Promise(res => setTimeout(res, 500));
                    } else {
                        console.error("All refresh attempts failed");

                        if (hasAccessToken) {
                            this.redirectToKeycloak();
                        }
                        return false;
                    }
                }
            }

            return false;
        })();

        try {
            return await this.refreshPromise;
        } finally {
            this.refreshPromise = null;
        }
    }
}

export default AuthService;