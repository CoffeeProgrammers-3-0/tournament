import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import PageContainer from '../../pages/PageContainer';

// Correct the paths to go up two levels to reach the src/components directory
vi.mock('../../components/main/AppHeader', () => ({
    AppHeader: () => <div data-testid="mock-header">Header</div>
}));

vi.mock('../../components/main/AppFooter', () => ({
    AppFooter: () => <div data-testid="mock-footer">Footer</div>
}));

describe('PageContainer', () => {
    it('renders the header, footer, and children correctly', () => {
        render(
            <PageContainer>
                <div data-testid="test-child">Content Area</div>
            </PageContainer>
        );

        // Check if Header and Footer mocks are used
        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();

        // Check if children are rendered
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        expect(screen.getByText('Content Area')).toBeInTheDocument();
    });

    it('wraps content in a main tag', () => {
        render(
            <PageContainer>
                <p>Hello World</p>
            </PageContainer>
        );

        // Verified by the component="main" prop on the Box
        const mainElement = screen.getByRole('main');
        expect(mainElement).toBeInTheDocument();
        expect(mainElement).toHaveTextContent('Hello World');
    });

    it('applies correct layout styles', () => {
        const { container } = render(
            <PageContainer>
                <div>Styled Content</div>
            </PageContainer>
        );

        // The outer Box is the first child of the container
        const outerBox = container.firstChild as HTMLElement;

        // Check the specific MUI sx transformed styles
        expect(outerBox).toHaveStyle({
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        });
    });
});