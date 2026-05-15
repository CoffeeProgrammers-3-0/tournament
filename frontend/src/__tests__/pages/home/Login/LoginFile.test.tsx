import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import LoginPage from '../../../../pages/home/Login/LoginPage';
import AuthService from '../../../../services/auth/AuthService';

// 1. FIX: The path inside vi.mock MUST match the import path used in LoginPage.tsx EXACTLY.
// If LoginPage uses '../../../../services/auth/AuthService', the mock must use that same path.
vi.mock('../../../../services/auth/AuthService', () => ({
    default: {
        redirectToKeycloak: vi.fn(),
    },
}));

// 2. Mock useTranslation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call AuthService.redirectToKeycloak exactly once on mount', () => {
        render(<LoginPage />);

        // Because we mocked the path correctly, this is now a valid spy
        expect(AuthService.redirectToKeycloak).toHaveBeenCalledTimes(1);
    });

    it('should render the translation key for the login title', () => {
        render(<LoginPage />);

        const message = screen.getByText('login.title');
        expect(message).toBeInTheDocument();
    });

    it('should have centered text alignment', () => {
        const { container } = render(<LoginPage />);

        // The first child is the <Box> component
        const boxElement = container.firstChild as HTMLElement;
        expect(boxElement).toHaveStyle({ textAlign: 'center' });
    });
});