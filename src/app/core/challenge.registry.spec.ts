import { describe, expect, it } from 'vitest';
import { COMMAND_CATALOG, COMMAND_IDS } from './command.catalog';
import {
  CHALLENGES,
  GROUPS,
  INVALID_CHALLENGES,
  challengesByGroup,
  challengesForCommand,
  findChallenge,
  firstChallenge,
  groupProgress,
  isPlayable,
  neighbours,
  pickRandomChallenge,
  playableChallenges,
} from './challenge.registry';

describe('challenge registry integrity', () => {
  it('loads the expected number of challenges per group', () => {
    expect(GROUPS).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(challengesByGroup('A')).toHaveLength(45);
    expect(challengesByGroup('B')).toHaveLength(37);
    expect(challengesByGroup('C')).toHaveLength(20);
    expect(challengesByGroup('D')).toHaveLength(11);
    expect(challengesByGroup('E')).toHaveLength(6);
    expect(challengesByGroup('F')).toHaveLength(5);
    expect(CHALLENGES).toHaveLength(124);
  });

  it('has no structurally invalid challenge', () => {
    expect(INVALID_CHALLENGES).toEqual([]);
    expect(playableChallenges()).toHaveLength(CHALLENGES.length);
    expect(CHALLENGES.every(isPlayable)).toBe(true);
  });

  it('gives every command in the universe its minimum coverage (AC-9)', () => {
    for (const command of COMMAND_CATALOG) {
      const count = challengesForCommand(command.id).length;
      expect(
        count,
        `${command.id} needs ${command.minChallenges} challenge(s)`,
      ).toBeGreaterThanOrEqual(command.minChallenges);
    }
  });

  it('keeps every challenge inside the command universe', () => {
    for (const challenge of CHALLENGES) {
      expect(COMMAND_IDS.has(challenge.targetCommand)).toBe(true);
    }
  });

  it('uses unique ids', () => {
    const ids = new Set(CHALLENGES.map((challenge) => challenge.id));
    expect(ids.size).toBe(CHALLENGES.length);
  });

  it('orders by group and then order', () => {
    const groupIndex = new Map(GROUPS.map((group, index) => [group, index]));
    const sorted = [...CHALLENGES].sort((a, b) => {
      const delta = (groupIndex.get(a.group) ?? 0) - (groupIndex.get(b.group) ?? 0);
      return delta !== 0 ? delta : a.order - b.order;
    });
    expect(CHALLENGES.map((challenge) => challenge.id)).toEqual(
      sorted.map((challenge) => challenge.id),
    );
  });
});

describe('challenge lookups', () => {
  it('finds challenges by id and tolerates unknown ids', () => {
    expect(findChallenge('a-01-h')?.targetCommand).toBe('h');
    expect(findChallenge('nope')).toBeNull();
    expect(findChallenge(null)).toBeNull();
  });

  it('exposes a first challenge', () => {
    expect(firstChallenge()).toBe(CHALLENGES[0]);
  });
});

describe('pickRandomChallenge', () => {
  it('never repeats the previous challenge when alternatives exist', () => {
    const previous = CHALLENGES[0];
    for (let i = 0; i < 50; i += 1) {
      const picked = pickRandomChallenge(previous.id);
      expect(picked?.id).not.toBe(previous.id);
    }
  });

  it('is deterministic given a random source', () => {
    expect(pickRandomChallenge(null, () => 0)).toBe(CHALLENGES[0]);
  });

  it('picks the last eligible challenge for a random value near one', () => {
    expect(pickRandomChallenge(null, () => 0.999)).toBe(CHALLENGES[CHALLENGES.length - 1]);
  });

  it('clamps a random value of exactly one', () => {
    expect(pickRandomChallenge(null, () => 1)).toBe(CHALLENGES[CHALLENGES.length - 1]);
  });
});

describe('neighbours', () => {
  it('has no previous on the first challenge and no next on the last', () => {
    const pool = playableChallenges();
    expect(neighbours(pool[0].id).previous).toBeNull();
    expect(neighbours(pool[0].id).next?.id).toBe(pool[1].id);
    expect(neighbours(pool[pool.length - 1].id).next).toBeNull();
    expect(neighbours(pool[pool.length - 1].id).previous?.id).toBe(pool[pool.length - 2].id);
  });

  it('returns nulls for unknown ids', () => {
    expect(neighbours('nope')).toEqual({ previous: null, next: null });
    expect(neighbours(null)).toEqual({ previous: null, next: null });
  });
});

describe('groupProgress', () => {
  it('counts totals and completions per group', () => {
    const progress = groupProgress({});
    expect(progress.A).toEqual({ done: 0, total: 45 });
    expect(progress.F).toEqual({ done: 0, total: 5 });

    const withResult = groupProgress({
      [firstChallenge()!.id]: { bestKeystrokes: 1, bestSeconds: 1, attempts: 1 },
    });
    expect(withResult.A).toEqual({ done: 1, total: 45 });
  });
});
