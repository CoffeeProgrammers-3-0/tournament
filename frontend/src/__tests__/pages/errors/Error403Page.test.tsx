import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Error403Page} from '../../../pages/errors/Error403Page';
import {BrowserRouter} from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// 3. FIX: Path must go up 3 levels: errors -> pages -> __tests__ -> src
vi.mock('../../../assets/403.svg', () => ({
    default: 'mocked-403-path'
}));

describe('Error403Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the error image with correct alt text', () => {
        render(<Error403Page />, { wrapper: BrowserRouter });
        const img = screen.getByAltText('403 Forbiden');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'mocked-403-path');
    });

    it('renders the translation keys for title and description', () => {
        render(<Error403Page />, { wrapper: BrowserRouter });
        expect(screen.getByText('errors.403.title')).toBeInTheDocument();
        expect(screen.getByText('errors.403.description')).toBeInTheDocument();
    });

    it('navigates to homepage when button is clicked', () => {
        render(<Error403Page />, { wrapper: BrowserRouter });
        const button = screen.getByRole('button', { name: /common.goHome/i });

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});