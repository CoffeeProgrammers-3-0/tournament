import axios from 'axios';
import Cookies from 'js-cookie';

// Збираємо всі посилання та параметри в один конфіг
const AUTH_CONFIG = {
    KEYCLOAK_AUTH_URL: import.meta.env.VITE_KEYCLOAK_AUTH_URL || "http://localhost:8080/realms/coffee-programmers/protocol/openid-connect/auth",
    CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "coffee-programmers-client",
    REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/callback`,
    API_BASE_URL: import.meta.env.VITE_AUTH_API_URL || "http://localhost:8081"
};

class AuthService {
    private static refreshPromise: Promise<boolean> | null = null;

    static redirectToKeycloak(): void {
        const currentPath = window.location.pathname;

        // Зберігаємо шлях, щоб повернутися на нього після авторизації
        if (currentPath !== '/callback' && currentPath !== '/login') {
            localStorage.setItem('preLoginPath', currentPath);
        } else {
            localStorage.setItem('preLoginPath', '/home');
        }

        const loginUrl = `${AUTH_CONFIG.KEYCLOAK_AUTH_URL}?client_id=${AUTH_CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(AUTH_CONFIG.REDIRECT_URI)}&response_type=code&scope=openid`;

        window.location.href = loginUrl;
    }

    static async logout(): Promise<void> {
        const userId = Cookies.get('userId');

        try {
            await axios.post(`${AUTH_CONFIG.API_BASE_URL}/api/auth/logout`, {}, {
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
                    `${AUTH_CONFIG.API_BASE_URL}/api/auth/refresh`,
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