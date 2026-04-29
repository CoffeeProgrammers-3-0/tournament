import {describe, expect, it} from 'vitest';
import {formatDisplay, toLocalInput, toUtcIso} from '../../utils/data';

describe('Date utils', () => {
    it('toLocalInput formats ISO correctly', () => {
        const result = toLocalInput('2024-01-01T10:00:00Z');
        expect(result).toMatch('2024-01-01');
    });

    it('toLocalInput returns empty string if no input', () => {
        expect(toLocalInput()).toBe('');
    });

    it('toUtcIso converts to ISO', () => {
        const result = toUtcIso('2024-01-01T10:00');
        expect(result).toContain('2024-01-01');
        expect(result).toContain('T');
    });

    it('toUtcIso returns empty if no input', () => {
        expect(toUtcIso()).toBe('');
    });

    it('formatDisplay formats date in uk locale', () => {
        const result = formatDisplay('2024-01-01T10:00:00Z', 'uk');
        expect(result).toContain('2024');
    });

    it('formatDisplay formats date in en locale', () => {
        const result = formatDisplay('2024-01-01T10:00:00Z', 'en');
        expect(result).toContain('2024');
    });

    it('formatDisplay handles Date object', () => {
        const result = formatDisplay(new Date(), 'en');
        expect(result).toBeTruthy();
    });

    it('formatDisplay returns empty for invalid input', () => {
        expect(formatDisplay('', 'en')).toBe('');
    });
});