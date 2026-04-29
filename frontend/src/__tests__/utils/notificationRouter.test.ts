import {describe, expect, it} from 'vitest';
import {getNotificationLink} from '../../utils/notificationRouter';

describe('getNotificationLink', () => {
    it('returns global notifications', () => {
        expect(getNotificationLink({ isGlobal: true })).toBe('/notifications');
    });

    it('handles round event', () => {
        const result = getNotificationLink({
            key: 'something.round_event',
            payload: JSON.stringify({ roundId: 5 })
        });

        expect(result).toBe('/rounds/5');
    });

    it('handles team notification', () => {
        const result = getNotificationLink({
            key: 'something.team',
            payload: JSON.stringify({ teamId: 10 })
        });

        expect(result).toBe('/teams/10');
    });

    it('handles jury submission', () => {
        const result = getNotificationLink({
            key: 'something.jury_submission',
            payload: JSON.stringify({ submissionId: 7 })
        });

        expect(result).toBe('/submissions/7');
    });

    it('handles tournament', () => {
        const result = getNotificationLink({
            key: 'something.tournament',
            payload: JSON.stringify({ tournamentId: 3 })
        });

        expect(result).toBe('/tournaments/3');
    });

    it('fallbacks to notifications on unknown key', () => {
        const result = getNotificationLink({
            key: 'unknown',
            payload: '{}'
        });

        expect(result).toBe('/notifications');
    });

    it('handles invalid JSON payload', () => {
        const result = getNotificationLink({
            key: 'something.round',
            payload: 'invalid-json'
        });

        expect(result).toBe('/notifications');
    });
});