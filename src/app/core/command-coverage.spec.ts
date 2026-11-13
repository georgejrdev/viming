import { describe, expect, it } from 'vitest';
import { COMMAND_CATALOG } from './command.catalog';
import { challengesForCommand } from './challenge.registry';

/**
 * AC-9 evidence: every command in the closed universe has at least
 * `minChallenges` playable challenges.
 */
describe('command coverage', () => {
  for (const command of COMMAND_CATALOG) {
    it(`${command.id} has at least ${command.minChallenges} challenge(s)`, () => {
      expect(challengesForCommand(command.id).length).toBeGreaterThanOrEqual(command.minChallenges);
    });
  }
});
