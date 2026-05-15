import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import Cookies from 'js-cookie';
import AuthService from '../../services/auth/AuthService';
import {client} from '../../utils/client';

import type {AxiosRequestConfig} from 'axios';

beforeEach(() => {
    vi.clearAllMocks();

    (client.defaults.adapter as any) = vi.fn(
        async (config: AxiosRequestConfig) => {
            return {
                data: {},
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        }
    );

    Object.defineProperty(window, 'location', {
        writable: true,
        value: {
            ...window.location,
            replace: vi.fn(),
        },
    });
});

vi.mock('js-cookie', () => ({
    default: {
        get: vi.fn(),
        remove: vi.fn()
    }
}));

vi.mock('../../services/auth/AuthService', () => ({
    default: {
        refresh: vi.fn()
    }
}));

const mockGet = Cookies.get as any;
const mockRemove = Cookies.remove as any;

describe('Axios interceptors (clean)', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        vi.clearAllMocks();

        // Fix window.location.replace
        Object.defineProperty(window, 'location', {
            writable: true,
            value: {
                ...originalLocation,
                replace: vi.fn(),
            },
        });

        // Prevent real axios calls
        vi.spyOn(client, 'request').mockResolvedValue({ data: {} } as any);
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: originalLocation,
        });
    });

    it('adds Authorization header if token exists', async () => {
        mockGet.mockReturnValue('token123');

        const handler = (client.interceptors.request as any).handlers[0].fulfilled;

        const req = await handler({
            headers: {}
        });

        expect(req.headers.Authorization).toBe('Bearer token123');
    });

    it('handles network error (no response)', async () => {
        const handler = (client.interceptors.response as any).handlers[0].rejected;

        const error = { config: {} };

        await expect(handler(error)).rejects.toBe(error);

        expect(AuthService.refresh).toHaveBeenCalled();
    });

    it('retries request on 401 with success refresh', async () => {
        mockGet.mockReturnValue('new-token');
        (AuthService.refresh as any).mockResolvedValue(true);

        const handler = (client.interceptors.response as any).handlers[0].rejected;

        const error = {
            config: { headers: {}, _retried: false },
            response: { status: 401 }
        };

        await handler(error);

        expect(AuthService.refresh).toHaveBeenCalled();
    });

    it('redirects on refresh failure', async () => {
        (AuthService.refresh as any).mockRejectedValue(new Error());

        const handler = (client.interceptors.response as any).handlers[0].rejected;

        const error = {
            config: { headers: {}, _retried: false },
            response: { status: 401 }
        };

        await expect(handler(error)).rejects.toBeTruthy();

        expect(mockRemove).toHaveBeenCalledWith('accessToken');
        expect(window.location.replace).toHaveBeenCalledWith('/login');
    });

    it('redirects on 403', async () => {
        const handler = (client.interceptors.response as any).handlers[0].rejected;

        const error = {
            config: {},
            response: { status: 403 }
        };

        await expect(handler(error)).rejects.toBeTruthy();

        expect(window.location.replace).toHaveBeenCalledWith('/403');
    });

    it('redirects on 404', async () => {
        const handler = (client.interceptors.response as any).handlers[0].rejected;

        const error = {
            config: {},
            response: { status: 404 }
        };

        await expect(handler(error)).rejects.toBeTruthy();

        expect(window.location.replace).toHaveBeenCalledWith('/404');
    });
});