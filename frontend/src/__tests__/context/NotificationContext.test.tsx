import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {NotificationProvider, useNotification} from '../../context/NotificationContext';
import {useNotificationSocket} from '../../hooks/useNotificationSocket';
import Cookies from 'js-cookie';

// --- MOCKS ---

vi.mock('../../hooks/useNotificationSocket', () => ({
    useNotificationSocket: vi.fn()
}));

const navigateMock = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigateMock
}));

vi.mock('js-cookie', () => ({
    default: {
        get: vi.fn()
    }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key // simple passthrough
    })
}));

// --- TEST HELPER COMPONENT ---
const TestComponent = () => {
    const { unseenCount } = useNotification();
    return <div data-testid="count">{unseenCount}</div>;
};

describe('NotificationProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('provides unseenCount from socket', () => {
        (Cookies.get as any).mockReturnValue('user'); // logged in

        (useNotificationSocket as any).mockReturnValue({
            unseenCount: 5,
            latestNotification: null
        });

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        expect(screen.getByTestId('count').textContent).toBe('5');
    });

    it('shows snackbar when notification arrives', () => {
        (Cookies.get as any).mockReturnValue('user');

        (useNotificationSocket as any).mockReturnValue({
            unseenCount: 1,
            latestNotification: {
                content: 'Hello',
                key: 'test.key',
                isGlobal: false,
                payload: '{}'
            }
        });

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        expect(screen.getByText('test.key')).toBeInTheDocument();
    });

    it('handles global notification rendering', () => {
        (Cookies.get as any).mockReturnValue('user');

        (useNotificationSocket as any).mockReturnValue({
            unseenCount: 1,
            latestNotification: {
                content: '<b>Admin message</b>',
                isGlobal: true,
                system: false
            }
        });

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        expect(screen.getByText('notifications.global.admin_message')).toBeInTheDocument();
    });

    it('decreases unseenCount and navigates on click', () => {
        (Cookies.get as any).mockReturnValue('user');

        (useNotificationSocket as any).mockReturnValue({
            unseenCount: 3,
            latestNotification: {
                content: 'Hello',
                key: 'test.key',
                isGlobal: false,
                payload: JSON.stringify({ roundId: 10 })
            }
        });

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        fireEvent.click(screen.getByText('test.key'));

        expect(navigateMock).toHaveBeenCalled();
    });

    it('handles invalid payload safely', () => {
        (Cookies.get as any).mockReturnValue('user');

        (useNotificationSocket as any).mockReturnValue({
            unseenCount: 1,
            latestNotification: {
                content: 'Hello',
                key: 'test.key',
                isGlobal: false,
                payload: 'INVALID_JSON'
            }
        });

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        expect(screen.getByText('test.key')).toBeInTheDocument();
    });

    it('does not crash when not logged in', () => {
        (Cookies.get as any).mockReturnValue(undefined);

        (useNotificationSocket as any).mockReturnValue({
            unseenCount: 0,
            latestNotification: null
        });

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        expect(screen.getByTestId('count').textContent).toBe('0');
    });
});