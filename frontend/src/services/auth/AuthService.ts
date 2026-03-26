import axios from 'axios';
import Cookies from 'js-cookie';

class AuthService {
    private static refreshPromise: Promise<boolean> | null = null;

    static redirectToKeycloak(): void {
        localStorage.setItem('preLoginPath', window.location.pathname);

        const currentPath = window.location.pathname;

        if (currentPath !== '/callback' && currentPath !== '/login') {
            localStorage.setItem('preLoginPath', currentPath);
        } else {
            localStorage.setItem('preLoginPath', '/home');
        }

        const keycloakUrl = "http://localhost:8080/realms/coffee-programmers/protocol/openid-connect/auth";
        const clientId = "coffee-programmers-client";
        const redirectUri = "http://localhost:3000/callback";
        const loginUrl = `${keycloakUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid`;
        window.location.href = loginUrl;
    }

    static async logout(): Promise<void> {
        const userId = Cookies.get('userId');

        try {
            await axios.post('http://localhost:8081/api/auth/logout', {}, {
                params: {
                    userId,
                },
                withCredentials: true,
            });
            this.redirectToKeycloak()
        } catch (e) {
            console.error("Logout failed", e);
        }
    }

    static refresh(): Promise<boolean> {
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = (async () => {
            const refreshToken = Cookies.get("refreshToken");
            if (!refreshToken) {
                console.log("No refresh token available");
                return false; // ПРОСТО ПОВЕРТАЄМО FALSE, НЕ РЕДИРЕКТИМО
            }

            try {
                await axios.post(
                    "http://localhost:8081/api/auth/refresh",
                    {},
                    {
                        params: { refreshToken: encodeURIComponent(refreshToken) },
                        withCredentials: true,
                    }
                );
                return true;
            } catch (error) {
                console.error("Token refresh failed", error);
                return false; // ТУТ ТЕЖ НЕ РЕДИРЕКТИМО
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }
}

export default AuthService;
