import {beforeEach, describe, expect, it, vi} from 'vitest';
import {history} from '../../utils/history';

describe('history utility', () => {
    beforeEach(() => {
        history.navigate = null;
    });

    it('should have null navigate by default', () => {
        expect(history.navigate).toBeNull();
    });

    it('should allow setting navigate function', () => {
        const mockNavigate = vi.fn();

        history.navigate = mockNavigate;

        expect(history.navigate).toBe(mockNavigate);
    });

    it('should call navigate when assigned', () => {
        const mockNavigate = vi.fn();

        history.navigate = mockNavigate;

        history.navigate?.('/dashboard');

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should not throw if navigate is null', () => {
        expect(() => {
            history.navigate?.('/safe-call');
        }).not.toThrow();
    });
});