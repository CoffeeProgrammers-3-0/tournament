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

        if (currentPath === '/callback' || currentPath === '/login') {
            localStorage.setItem('preLoginPath', '/home');
        } else if (currentPath !== '/') {
            localStorage.setItem('preLoginPath', currentPath);
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
            // Обов'язково чистимо кукі на випадок, якщо бекенд впав
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            Cookies.remove('userId');

            // Після логауту зазвичай повертають на головну сторінку як гостя
            window.location.href = '/home';
        }
    }

    static refresh(): Promise<boolean> {
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = (async () => {
            const refreshToken = Cookies.get("refreshToken");
            const hasAccessToken = Cookies.get('accessToken') !== undefined;
            const isAuthed = Cookies.get("userId") !== undefined;

            if (!refreshToken) {
                console.log("No refresh token available");
                if (isAuthed) {
                    this.redirectToKeycloak();
                    return false;
                }
                return false;
            }

            try {
                await axios.post(
                    `${AUTH_CONFIG.API_BASE_URL}/auth/refresh`,
                    {},
                    {
                        params: { refreshToken: encodeURIComponent(refreshToken) },
                        withCredentials: true,
                    }
                );
                return true;
            } catch (error) {
                console.error("Token refresh failed", error);

                // Якщо спроба оновлення провалилася і користувач БУВ авторизований
                if (hasAccessToken) {
                    this.redirectToKeycloak();
                }
                return false;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }
}

export default AuthService;