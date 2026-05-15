import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import HomePage from "../../../../pages/home/Home/HomePage.tsx";

// ---------------- MOCKS ----------------

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('../../../../pages/home/Home/constants/homeSteps', () => ({
    getHomeSteps: vi.fn(() => [
        {
            icon: 'icon-1',
            title: 'step1',
            description: 'desc1',
            color: 'red',
        },
        {
            icon: 'icon-2',
            title: 'step2',
            description: 'desc2',
            color: 'blue',
        },
        {
            icon: 'icon-3',
            title: 'step3',
            description: 'desc3',
            color: 'green',
        },
    ]),
}));

vi.mock('../../../../pages/home/Home/components/StepCard', () => ({
    StepCard: ({ title }: any) => (
        <div data-testid="step-card">{title}</div>
    ),
}));

// ---------------- TESTS ----------------

describe('HomePage', () => {
    it('renders hero section', () => {
        render(<HomePage />);

        expect(screen.getByText('home.title')).toBeInTheDocument();
        expect(screen.getByText('home.description')).toBeInTheDocument();
    });

    it('renders how it works section title', () => {
        render(<HomePage />);

        expect(screen.getByText('home.how_it_works.title')).toBeInTheDocument();
    });

    it('renders all steps from getHomeSteps', () => {
        render(<HomePage />);

        const cards = screen.getAllByTestId('step-card');

        expect(cards).toHaveLength(3);
        expect(cards[0]).toHaveTextContent('step1');
        expect(cards[1]).toHaveTextContent('step2');
        expect(cards[2]).toHaveTextContent('step3');
    });
});