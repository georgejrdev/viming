import { describe, expect, it } from 'vitest';
import type { ChallengeDefinition, GroupId, ResultsMap } from './challenge.model';
import { playableChallenges } from './challenge.registry';
import { buildStats } from './stats';

function challenge(id: string, group: GroupId, command = 'x'): ChallengeDefinition {
  return {
    id,
    group,
    order: 0,
    difficulty: 1,
    titleKey: 'test.title',
    taskKey: 'test.task',
    initial: { text: '', cursor: { line: 0, ch: 0 } },
    target: { text: '' },
    targetCommand: command,
    par: { keystrokes: 1, seconds: 1 },
  };
}

const result = (bestKeystrokes: number, bestSeconds: number, attempts = 1) => ({
  bestKeystrokes,
  bestSeconds,
  attempts,
});

describe('buildStats', () => {
  it('reports an empty profile before the first completion', () => {
    const stats = buildStats([challenge('a', 'A'), challenge('b', 'B')], {});

    expect(stats.total).toBe(2);
    expect(stats.completed).toBe(0);
    expect(stats.percent).toBe(0);
    expect(stats.attempts).toBe(0);
    expect(stats.averageKeystrokes).toBeNull();
    expect(stats.averageSeconds).toBeNull();
    expect(stats.fastest).toBeNull();
    expect(stats.fewestKeys).toBeNull();
    expect(stats.groups).toEqual([
      { group: 'A', done: 0, total: 1, percent: 0 },
      { group: 'B', done: 0, total: 1, percent: 0 },
      { group: 'C', done: 0, total: 0, percent: 0 },
      { group: 'D', done: 0, total: 0, percent: 0 },
      { group: 'E', done: 0, total: 0, percent: 0 },
      { group: 'F', done: 0, total: 0, percent: 0 },
    ]);
  });

  it('aggregates completions, attempts and averages', () => {
    const results: ResultsMap = {
      a: result(4, 1.5, 2),
      b: result(6, 2.5, 3),
    };
    const stats = buildStats([challenge('a', 'A', 'h'), challenge('b', 'B', 'j')], results);

    expect(stats.completed).toBe(2);
    expect(stats.percent).toBe(100);
    expect(stats.attempts).toBe(5);
    expect(stats.averageKeystrokes).toBe(5);
    expect(stats.averageSeconds).toBe(2);
    expect(stats.fastest).toEqual({ challengeId: 'a', command: 'h', value: 1.5 });
    expect(stats.fewestKeys).toEqual({ challengeId: 'a', command: 'h', value: 4 });
    expect(stats.groups[0]).toEqual({ group: 'A', done: 1, total: 1, percent: 100 });
  });

  it('rounds the percentage to the nearest integer', () => {
    const challenges = [challenge('a', 'A'), challenge('b', 'A'), challenge('c', 'A')];

    expect(buildStats(challenges, { a: result(1, 1) }).percent).toBe(33);
    expect(buildStats(challenges, { a: result(1, 1), b: result(1, 1) }).percent).toBe(67);
  });

  it('ignores results whose challenge no longer exists', () => {
    const stats = buildStats([challenge('a', 'A')], {
      ghost: result(1, 1, 9),
    });

    expect(stats.completed).toBe(0);
    expect(stats.attempts).toBe(0);
    expect(stats.groups[0]).toEqual({ group: 'A', done: 0, total: 1, percent: 0 });
  });

  it('breaks ties by the complementary metric', () => {
    // Same time: the solve with fewer keystrokes wins "fastest".
    const sameTime = buildStats([challenge('slow', 'A'), challenge('lean', 'A')], {
      slow: result(9, 2),
      lean: result(5, 2),
    });
    expect(sameTime.fastest?.challengeId).toBe('lean');

    // Same keystrokes: the quicker solve wins "fewest keys".
    const sameKeys = buildStats([challenge('late', 'A'), challenge('early', 'A')], {
      late: result(5, 3),
      early: result(5, 1.5),
    });
    expect(sameKeys.fewestKeys?.challengeId).toBe('early');
  });

  it('uses the real curriculum totals', () => {
    const stats = buildStats(playableChallenges(), {});
    const total = stats.groups.reduce((sum, group) => sum + group.total, 0);

    expect(stats.total).toBe(playableChallenges().length);
    expect(total).toBe(stats.total);
    expect(stats.groups.map((group) => group.group)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });
});
