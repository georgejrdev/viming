import type { ChallengeDefinition, ChallengeResult } from './challenge.model';

export interface Attempt {
  keystrokes: number;
  elapsedMs: number;
}

export interface Comparison {
  keystrokesDelta: number;
  secondsDelta: number;
}

/** Positive delta means the user spent more than the par. */
export function compareToPar(challenge: ChallengeDefinition, attempt: Attempt): Comparison {
  return {
    keystrokesDelta: attempt.keystrokes - challenge.par.keystrokes,
    secondsDelta: attempt.elapsedMs / 1000 - challenge.par.seconds,
  };
}

export function formatSeconds(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0.0';
  return (ms / 1000).toFixed(1);
}

export function formatDelta(value: number, digits = 0): string {
  const rounded = digits === 0 ? Math.round(value) : Number(value.toFixed(digits));
  if (rounded > 0) return `+${rounded}`;
  if (rounded < 0) return `${rounded}`;
  return '0';
}

/**
 * Best result policy: fewer keystrokes wins; ties are broken by time.
 * Attempts always increment, even when the new attempt is not a personal best.
 */
export function mergeResult(
  previous: ChallengeResult | undefined,
  attempt: Attempt,
): ChallengeResult {
  const seconds = attempt.elapsedMs / 1000;
  if (!previous) {
    return {
      bestKeystrokes: attempt.keystrokes,
      bestSeconds: seconds,
      attempts: 1,
    };
  }

  const better =
    attempt.keystrokes < previous.bestKeystrokes ||
    (attempt.keystrokes === previous.bestKeystrokes && seconds < previous.bestSeconds);

  return {
    bestKeystrokes: better ? attempt.keystrokes : previous.bestKeystrokes,
    bestSeconds: better ? seconds : previous.bestSeconds,
    attempts: previous.attempts + 1,
  };
}
