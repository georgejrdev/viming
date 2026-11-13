import { groupAChallenges } from '../challenges/group-a.js';
import { groupBChallenges } from '../challenges/group-b.js';
import { groupCChallenges } from '../challenges/group-c.js';
import { groupDChallenges } from '../challenges/group-d.js';
import { groupEChallenges } from '../challenges/group-e.js';
import { groupFChallenges } from '../challenges/group-f.js';
import { GROUP_IDS } from './challenge.model';
import type { ChallengeDefinition, GroupId, ResultsMap } from './challenge.model';
import { challengeProblems } from './challenge.validate';

/** Kept as `GROUPS` for the existing callers; the order lives in the model. */
export const GROUPS = GROUP_IDS;

export const RAW_CHALLENGES = [
  ...groupAChallenges,
  ...groupBChallenges,
  ...groupCChallenges,
  ...groupDChallenges,
  ...groupEChallenges,
  ...groupFChallenges,
] as ChallengeDefinition[];

const groupIndex = new Map<GroupId, number>(GROUPS.map((group, index) => [group, index]));

export const CHALLENGES: readonly ChallengeDefinition[] = [...RAW_CHALLENGES].sort((a, b) => {
  const groupDelta = (groupIndex.get(a.group) ?? 0) - (groupIndex.get(b.group) ?? 0);
  return groupDelta !== 0 ? groupDelta : a.order - b.order;
});

export const INVALID_CHALLENGES: readonly {
  challenge: ChallengeDefinition;
  problems: string[];
}[] = CHALLENGES.map((challenge) => ({ challenge, problems: challengeProblems(challenge) })).filter(
  (entry) => entry.problems.length > 0,
);

export function isPlayable(challenge: ChallengeDefinition): boolean {
  return challengeProblems(challenge).length === 0;
}

export function playableChallenges(): readonly ChallengeDefinition[] {
  return CHALLENGES.filter(isPlayable);
}

export function challengesByGroup(group: GroupId): readonly ChallengeDefinition[] {
  return CHALLENGES.filter((challenge) => challenge.group === group);
}

export function challengesForCommand(commandId: string): readonly ChallengeDefinition[] {
  return CHALLENGES.filter((challenge) => challenge.targetCommand === commandId);
}

export function findChallenge(id: string | null | undefined): ChallengeDefinition | null {
  if (!id) return null;
  return CHALLENGES.find((challenge) => challenge.id === id) ?? null;
}

export function firstChallenge(): ChallengeDefinition | null {
  return playableChallenges()[0] ?? null;
}

/**
 * Random mode never repeats the immediately previous challenge (AC-10).
 * If only one playable challenge exists, returning it is the only option.
 */
export function pickRandomChallenge(
  excludeId: string | null,
  random: () => number = Math.random,
): ChallengeDefinition | null {
  const pool = playableChallenges();
  if (pool.length === 0) return null;
  const eligible = pool.filter((challenge) => challenge.id !== excludeId);
  const candidates = eligible.length > 0 ? eligible : pool;
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  return candidates[index];
}

export function neighbours(id: string | null): {
  previous: ChallengeDefinition | null;
  next: ChallengeDefinition | null;
} {
  const pool = playableChallenges();
  const index = pool.findIndex((challenge) => challenge.id === id);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? pool[index - 1] : null,
    next: index < pool.length - 1 ? pool[index + 1] : null,
  };
}

export function groupProgress(
  results: ResultsMap,
): Record<GroupId, { done: number; total: number }> {
  const progress = Object.fromEntries(
    GROUPS.map((group) => [group, { done: 0, total: 0 }]),
  ) as Record<GroupId, { done: number; total: number }>;

  for (const challenge of CHALLENGES) {
    const bucket = progress[challenge.group];
    if (!bucket) continue;
    bucket.total += 1;
    if (results[challenge.id]) bucket.done += 1;
  }

  return progress;
}
