import {afterEach, beforeEach, describe, expect, it, type Mock, type MockInstance, vi} from 'vitest';
import axios from 'axios';
import Cookies from 'js-cookie';
import AuthService from '../../../services/auth/AuthService';

// Надійний мок для js-cookie
vi.mock('js-cookie', () => ({
    default: {
        get: vi.fn(),
        remove: vi.fn()
    }
}));
vi.mock('axios');

const mockedAxios = vi.mocked(axios);

const mockCookiesGet = Cookies.get as unknown as Mock<(key: string) => string | undefined>;
const mockCookiesRemove = Cookies.remove as Mock<(key: string) => void>;

describe('AuthService', () => {
    const originalLocation = window.location;

    let consoleErrorSpy: MockInstance;
    let consoleLogSpy: MockInstance;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Очищаємо кеш промісу
        (AuthService as any).refreshPromise = null;

        // Безпечний мок window.location
        Object.defineProperty(window, 'location', {
            value: { href: '', pathname: '/', origin: 'http://localhost' },
            writable: true,
            configurable: true
        });

        // Мокаємо console.error та console.log
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        // Відновлюємо оригінальний об'єкт location
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true,
            configurable: true
        });

        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    describe('redirectToKeycloak', () => {
        it('зберігає поточний шлях та перенаправляє на Keycloak', () => {
            window.location.pathname = '/dashboard';

            AuthService.redirectToKeycloak();

            expect(localStorage.getItem('preLoginPath')).toBe('/dashboard');
            expect(window.location.href).toContain('protocol/openid-connect/auth');
            expect(window.location.href).toContain('client_id=');
        });

        it('зберігає /home, якщо поточний шлях це /callback або /login', () => {
            window.location.pathname = '/callback';
            AuthService.redirectToKeycloak();
            expect(localStorage.getItem('preLoginPath')).toBe('/home');

            window.location.pathname = '/login';
            AuthService.redirectToKeycloak();
            expect(localStorage.getItem('preLoginPath')).toBe('/home');
        });
    });

    describe('logout', () => {
        it('викликає API, чистить кукі та перенаправляє', async () => {
            mockCookiesGet.mockReturnValue('123');
            mockedAxios.post.mockResolvedValue({});

            await AuthService.logout();

            expect(mockedAxios.post).toHaveBeenCalled();
            expect(mockCookiesRemove).toHaveBeenCalledWith('accessToken');
            expect(mockCookiesRemove).toHaveBeenCalledWith('refreshToken');
            expect(mockCookiesRemove).toHaveBeenCalledWith('userId');
            expect(window.location.href).toBe('/home');
        });

        it('обробляє помилку API, але все одно чистить кукі та перенаправляє', async () => {
            mockCookiesGet.mockReturnValue('123');
            mockedAxios.post.mockRejectedValue(new Error('API Down'));

            await AuthService.logout();

            expect(consoleErrorSpy).toHaveBeenCalledWith("Logout failed", expect.any(Error));
            expect(mockCookiesRemove).toHaveBeenCalledWith('accessToken');
            expect(window.location.href).toBe('/home');
        });
    });

    describe('refresh', () => {
        it('повертає false, якщо немає refresh token і користувач не авторизований', async () => {
            mockCookiesGet.mockReturnValue(undefined);

            const result = await AuthService.refresh();

            expect(result).toBe(false);
            expect(mockedAxios.post).not.toHaveBeenCalled();
        });

        it('перенаправляє, якщо refresh token відсутній, але є userId', async () => {
            // Явно вказуємо тип 'string' для параметра 'key'
            mockCookiesGet.mockImplementation((key: string) => key === 'userId' ? '123' : undefined);

            const redirectSpy = vi.spyOn(AuthService, 'redirectToKeycloak').mockImplementation(() => {});

            const result = await AuthService.refresh();

            expect(result).toBe(false);
            expect(redirectSpy).toHaveBeenCalled();
        });

        it('успішно оновлює токен', async () => {
            // Явно вказуємо тип 'string' для параметра 'key'
            mockCookiesGet.mockImplementation((key: string) => {
                if (key === 'refreshToken') return 'valid-refresh';
                if (key === 'accessToken') return 'valid-access';
                if (key === 'userId') return '123';
                return undefined;
            });
            mockedAxios.post.mockResolvedValue({ data: {} });

            const result = await AuthService.refresh();

            expect(result).toBe(true);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/auth/refresh'),
                {},
                expect.objectContaining({ withCredentials: true })
            );
        });

        it('обробляє помилку та перенаправляє на Keycloak (якщо був access токен)', async () => {
            // Явно вказуємо тип 'string' для параметра 'key'
            mockCookiesGet.mockImplementation((key: string) => {
                if (key === 'refreshToken') return 'old-refresh';
                if (key === 'accessToken') return 'old-access'; // hasAccessToken === true
                if (key === 'userId') return '123';
                return undefined;
            });

            mockedAxios.post.mockRejectedValue(new Error('Network error'));
            const redirectSpy = vi.spyOn(AuthService, 'redirectToKeycloak').mockImplementation(() => {});

            const result = await AuthService.refresh();

            expect(result).toBe(false);
            expect(redirectSpy).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith("Token refresh failed", expect.any(Error));
        });

        it('обробляє помилку, але НЕ перенаправляє, якщо не було access токена', async () => {
            // Явно вказуємо тип 'string' для параметра 'key'
            mockCookiesGet.mockImplementation((key: string) => {
                if (key === 'refreshToken') return 'old-refresh';
                if (key === 'accessToken') return undefined; // hasAccessToken === false
                if (key === 'userId') return '123';
                return undefined;
            });

            mockedAxios.post.mockRejectedValue(new Error('Network error'));
            const redirectSpy = vi.spyOn(AuthService, 'redirectToKeycloak').mockImplementation(() => {});

            const result = await AuthService.refresh();

            expect(result).toBe(false);
            expect(redirectSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith("Token refresh failed", expect.any(Error));
        });

        it('кешує запит (не робить два запити одночасно)', async () => {
            mockCookiesGet.mockReturnValue('token');

            mockedAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({}), 50)));

            const promise1 = AuthService.refresh();
            const promise2 = AuthService.refresh();

            await Promise.all([promise1, promise2]);

            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });
    });
});