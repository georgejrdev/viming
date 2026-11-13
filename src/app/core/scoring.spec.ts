import { describe, expect, it } from 'vitest';
import type { ChallengeDefinition } from './challenge.model';
import { compareToPar, formatDelta, formatSeconds, mergeResult } from './scoring';

const challenge = {
  par: { keystrokes: 4, seconds: 8 },
} as ChallengeDefinition;

describe('compareToPar', () => {
  it('is positive when the attempt is worse than par', () => {
    expect(compareToPar(challenge, { keystrokes: 6, elapsedMs: 10_000 })).toEqual({
      keystrokesDelta: 2,
      secondsDelta: 2,
    });
  });

  it('is negative when the attempt is better than par', () => {
    expect(compareToPar(challenge, { keystrokes: 2, elapsedMs: 6_000 })).toEqual({
      keystrokesDelta: -2,
      secondsDelta: -2,
    });
  });
});

describe('formatSeconds', () => {
  it('formats milliseconds with one decimal', () => {
    expect(formatSeconds(1_234)).toBe('1.2');
    expect(formatSeconds(0)).toBe('0.0');
  });

  it('clamps invalid values', () => {
    expect(formatSeconds(-10)).toBe('0.0');
    expect(formatSeconds(Number.NaN)).toBe('0.0');
  });
});

describe('formatDelta', () => {
  it('adds a plus sign for positive values', () => {
    expect(formatDelta(3)).toBe('+3');
    expect(formatDelta(-3)).toBe('-3');
    expect(formatDelta(0)).toBe('0');
  });

  it('rounds with the requested number of digits', () => {
    expect(formatDelta(1.26, 1)).toBe('+1.3');
    expect(formatDelta(-1.24, 1)).toBe('-1.2');
    expect(formatDelta(0.4)).toBe('0');
  });
});

describe('mergeResult', () => {
  it('creates the first result with one attempt', () => {
    expect(mergeResult(undefined, { keystrokes: 3, elapsedMs: 5_000 })).toEqual({
      bestKeystrokes: 3,
      bestSeconds: 5,
      attempts: 1,
    });
  });

  it('keeps the previous best when the new attempt is worse', () => {
    expect(
      mergeResult(
        { bestKeystrokes: 3, bestSeconds: 5, attempts: 1 },
        { keystrokes: 8, elapsedMs: 9_000 },
      ),
    ).toEqual({ bestKeystrokes: 3, bestSeconds: 5, attempts: 2 });
  });

  it('replaces the best when fewer keystrokes are used', () => {
    expect(
      mergeResult(
        { bestKeystrokes: 5, bestSeconds: 4, attempts: 2 },
        { keystrokes: 3, elapsedMs: 9_000 },
      ),
    ).toEqual({ bestKeystrokes: 3, bestSeconds: 9, attempts: 3 });
  });

  it('breaks ties on time', () => {
    expect(
      mergeResult(
        { bestKeystrokes: 3, bestSeconds: 5, attempts: 1 },
        { keystrokes: 3, elapsedMs: 4_000 },
      ),
    ).toEqual({ bestKeystrokes: 3, bestSeconds: 4, attempts: 2 });

    expect(
      mergeResult(
        { bestKeystrokes: 3, bestSeconds: 5, attempts: 1 },
        { keystrokes: 3, elapsedMs: 6_000 },
      ),
    ).toEqual({ bestKeystrokes: 3, bestSeconds: 5, attempts: 2 });
  });
});
