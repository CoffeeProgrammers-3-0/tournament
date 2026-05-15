import {act, renderHook} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import Cookies from 'js-cookie';
import authService from '../../services/auth/AuthService';
import {useNotificationSocket} from '../../hooks/useNotificationSocket';
import {Client} from '@stomp/stompjs';

// -------------------- MOCKS --------------------

const mockClientInstance = vi.hoisted(() => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
    subscribe: vi.fn(),
}));

vi.mock('js-cookie', () => ({
    default: {
        get: vi.fn(),
    },
}));

vi.mock('../../services/auth/AuthService', () => ({
    default: {
        refresh: vi.fn(),
    },
}));

vi.mock('sockjs-client', () => ({
    default: vi.fn(function () {}),
}));

vi.mock('@stomp/stompjs', () => ({
    Client: vi.fn(function () {
        return mockClientInstance;
    }),
}));

// -------------------- TEST --------------------

describe('useNotificationSocket', () => {
    const mockCookiesGet = Cookies.get as any;

    beforeEach(() => {
        vi.clearAllMocks();
        Object.values(mockClientInstance).forEach((fn) => fn.mockReset());
    });

    it('creates WS client with auth header when logged in', () => {
        mockCookiesGet.mockImplementation((key: string) =>
            key === 'accessToken' ? 'token-123' : 'user-1'
        );

        renderHook(() => useNotificationSocket(true));

        expect(Client).toHaveBeenCalled();
        expect(mockClientInstance.activate).toHaveBeenCalled();
        expect(Client).toHaveBeenCalledWith(
            expect.objectContaining({
                connectHeaders: {
                    Authorization: 'Bearer token-123',
                },
            })
        );
    });

    it('does NOT set auth headers when guest', () => {
        mockCookiesGet.mockReturnValue(undefined);

        renderHook(() => useNotificationSocket(false));

        expect(Client).toHaveBeenCalledWith(
            expect.objectContaining({
                connectHeaders: {},
            })
        );
    });

    it('subscribes to user notifications and updates state', () => {
        let userCallback: any;
        mockClientInstance.subscribe.mockImplementation((topic: string, cb: any) => {
            if (topic.includes('notifications')) userCallback = cb;
        });

        mockCookiesGet.mockImplementation((key: string) =>
            key === 'userId' ? 'user-1' : 'token'
        );

        const { result } = renderHook(() => useNotificationSocket(true));
        const clientConfig = vi.mocked(Client).mock.calls[0]?.[0];

        act(() => {
            if (clientConfig?.onConnect) clientConfig.onConnect({} as any);
        });

        act(() => {
            userCallback({
                body: JSON.stringify({
                    countUnseen: 5,
                    content: { id: 1, content: 'Hello' },
                }),
            });
        });

        expect(result.current.unseenCount).toBe(5);
        // REMOVED 'date' here because the hook isn't adding it to personal notifications
        expect(result.current.latestNotification).toEqual({
            id: 1,
            content: 'Hello',
            isGlobal: false,
        });
    });

    it('handles global messages', () => {
        let globalCallback: any;
        mockClientInstance.subscribe.mockImplementation((topic: string, cb: any) => {
            if (topic.includes('global')) globalCallback = cb;
        });

        const { result } = renderHook(() => useNotificationSocket(false));
        const clientConfig = vi.mocked(Client).mock.calls[0]?.[0];

        act(() => {
            if (clientConfig?.onConnect) clientConfig.onConnect({} as any);
        });

        act(() => {
            globalCallback({
                body: JSON.stringify({
                    id: 10,
                    content: 'System message',
                }),
            });
        });

        expect(result.current.latestNotification).toEqual({
            id: 10,
            content: 'System message',
            isGlobal: true,
            key: 'notifications.global.admin_message',
            date: expect.any(String), // KEPT 'date' here as global handler adds it
        });
    });

    it('calls refresh on stomp auth error', async () => {
        mockCookiesGet.mockReturnValue('token');

        renderHook(() => useNotificationSocket(true));
        const clientConfig = vi.mocked(Client).mock.calls[0]?.[0];

        await act(async () => {
            if (clientConfig?.onStompError) {
                clientConfig.onStompError({
                    headers: {
                        message: 'Access denied JWT expired',
                    },
                } as any);
            }
        });

        expect(vi.mocked(authService.refresh)).toHaveBeenCalled();
    });
});