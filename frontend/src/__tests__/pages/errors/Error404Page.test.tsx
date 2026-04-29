import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Error404Page} from '../../../pages/errors/Error404Page';
import {BrowserRouter} from 'react-router-dom';

// 1. Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// 2. Mock useTranslation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// 3. FIX: Path must go up 3 levels to reach src/, then into assets/
// This ensures Vitest intercepts the import inside the component
vi.mock('../../../assets/404.svg', () => ({
    default: 'mocked-404-path'
}));

describe('Error404Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the error image with correct alt text', () => {
        render(<Error404Page />, { wrapper: BrowserRouter });
        const img = screen.getByAltText('404 Not Found');
        expect(img).toBeInTheDocument();
        // Now this will match 'mocked-404-path' instead of the giant data URI
        expect(img).toHaveAttribute('src', 'mocked-404-path');
    });

    it('renders the translation keys for title and description', () => {
        render(<Error404Page />, { wrapper: BrowserRouter });
        expect(screen.getByText('errors.404.title')).toBeInTheDocument();
        expect(screen.getByText('errors.404.description')).toBeInTheDocument();
    });

    it('navigates to homepage when button is clicked', () => {
        render(<Error404Page />, { wrapper: BrowserRouter });
        const button = screen.getByRole('button', { name: /common.goHome/i });

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});