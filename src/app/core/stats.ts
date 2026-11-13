import { GROUP_IDS } from './challenge.model';
import type { ChallengeDefinition, GroupId, ResultsMap } from './challenge.model';

/**
 * Aggregates the stored results into the numbers the statistics panel shows.
 *
 * Pure on purpose: the panel only formats what this returns, so the maths can
 * be tested without a browser. Only the challenges passed in are counted, so
 * stale ids left by an older version of the content do not inflate the totals.
 */

export interface GroupStat {
  group: GroupId;
  done: number;
  total: number;
  percent: number;
}

export interface ExtremeStat {
  challengeId: string;
  command: string;
  /** Seconds for `fastest`, keystrokes for `fewestKeys`. */
  value: number;
}

export interface Stats {
  total: number;
  completed: number;
  percent: number;
  attempts: number;
  /** Best attempt average, in keystrokes. `null` until something is completed. */
  averageKeystrokes: number | null;
  /** Best attempt average, in seconds. `null` until something is completed. */
  averageSeconds: number | null;
  fastest: ExtremeStat | null;
  fewestKeys: ExtremeStat | null;
  groups: GroupStat[];
}

const percentOf = (done: number, total: number): number =>
  total === 0 ? 0 : Math.round((done / total) * 100);

export function buildStats(challenges: readonly ChallengeDefinition[], results: ResultsMap): Stats {
  const totals = new Map<GroupId, number>();
  const donePerGroup = new Map<GroupId, number>();

  let completed = 0;
  let attempts = 0;
  let keystrokes = 0;
  let seconds = 0;
  let fastest: ExtremeStat | null = null;
  let fewestKeys: ExtremeStat | null = null;

  for (const challenge of challenges) {
    totals.set(challenge.group, (totals.get(challenge.group) ?? 0) + 1);

    const result = results[challenge.id];
    if (!result) continue;

    completed += 1;
    donePerGroup.set(challenge.group, (donePerGroup.get(challenge.group) ?? 0) + 1);
    attempts += result.attempts;
    keystrokes += result.bestKeystrokes;
    seconds += result.bestSeconds;

    const candidate: ExtremeStat = {
      challengeId: challenge.id,
      command: challenge.targetCommand,
      value: result.bestSeconds,
    };

    const quicker =
      !fastest ||
      result.bestSeconds < fastest.value ||
      (result.bestSeconds === fastest.value && result.bestKeystrokes < keysOf(fastest, results));
    if (quicker) fastest = candidate;

    const leaner: ExtremeStat = { ...candidate, value: result.bestKeystrokes };
    const fewer =
      !fewestKeys ||
      result.bestKeystrokes < fewestKeys.value ||
      (result.bestKeystrokes === fewestKeys.value &&
        result.bestSeconds < secondsOf(fewestKeys, results));
    if (fewer) fewestKeys = leaner;
  }

  return {
    total: challenges.length,
    completed,
    percent: percentOf(completed, challenges.length),
    attempts,
    averageKeystrokes: completed === 0 ? null : keystrokes / completed,
    averageSeconds: completed === 0 ? null : seconds / completed,
    fastest,
    fewestKeys,
    groups: GROUP_IDS.map((group) => {
      const total = totals.get(group) ?? 0;
      const done = donePerGroup.get(group) ?? 0;
      return { group, done, total, percent: percentOf(done, total) };
    }),
  };
}

function keysOf(stat: ExtremeStat, results: ResultsMap): number {
  return results[stat.challengeId]?.bestKeystrokes ?? Number.POSITIVE_INFINITY;
}

function secondsOf(stat: ExtremeStat, results: ResultsMap): number {
  return results[stat.challengeId]?.bestSeconds ?? Number.POSITIVE_INFINITY;
}
