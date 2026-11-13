import { describe, expect, it } from 'vitest';
import type { ChallengeDefinition, Snapshot } from './challenge.model';
import {
  challengeProblems,
  evaluateChallenge,
  isValidChallenge,
  matchesTarget,
  normalizeSelection,
  samePosition,
  sameSelection,
  textFromLines,
} from './challenge.validate';

function makeChallenge(overrides: Partial<ChallengeDefinition> = {}): ChallengeDefinition {
  return {
    id: 'a-01-h',
    group: 'A',
    order: 1,
    difficulty: 1,
    titleKey: 'title.cmd.h',
    taskKey: 'task.reachGoal',
    initial: { text: 'ab', cursor: { line: 0, ch: 0 } },
    target: { text: 'abc' },
    targetCommand: 'h',
    par: { keystrokes: 1, seconds: 5 },
    ...overrides,
  };
}

function snapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    lines: ['abc'],
    cursor: { line: 0, ch: 0 },
    selection: null,
    mode: 'normal',
    ...overrides,
  };
}

describe('text helpers', () => {
  it('joins lines with newlines', () => {
    expect(textFromLines(['a', 'b'])).toBe('a\nb');
    expect(textFromLines([])).toBe('');
  });

  it('compares positions', () => {
    expect(samePosition({ line: 0, ch: 1 }, { line: 0, ch: 1 })).toBe(true);
    expect(samePosition({ line: 0, ch: 1 }, { line: 1, ch: 1 })).toBe(false);
  });

  it('normalizes empty selections to null', () => {
    expect(normalizeSelection(undefined)).toBeNull();
    expect(normalizeSelection({ anchor: { line: 0, ch: 1 }, head: { line: 0, ch: 1 } })).toBeNull();
    expect(normalizeSelection({ anchor: { line: 0, ch: 1 }, head: { line: 0, ch: 2 } })).toEqual({
      anchor: { line: 0, ch: 1 },
      head: { line: 0, ch: 2 },
    });
  });

  it('compares selections independently of orientation', () => {
    expect(sameSelection(null, undefined)).toBe(true);
    expect(
      sameSelection(
        { anchor: { line: 0, ch: 1 }, head: { line: 0, ch: 3 } },
        { anchor: { line: 0, ch: 1 }, head: { line: 0, ch: 3 } },
      ),
    ).toBe(true);
    expect(
      sameSelection(
        { anchor: { line: 0, ch: 1 }, head: { line: 0, ch: 3 } },
        { anchor: { line: 0, ch: 3 }, head: { line: 0, ch: 1 } },
      ),
    ).toBe(false);
  });
});

describe('matchesTarget', () => {
  it('requires the exact text', () => {
    expect(matchesTarget(snapshot(), { text: 'abc' })).toBe(true);
    expect(matchesTarget(snapshot(), { text: 'ab' })).toBe(false);
  });

  it('checks the cursor only when the target declares one', () => {
    expect(matchesTarget(snapshot(), { text: 'abc', cursor: { line: 0, ch: 2 } })).toBe(false);
    expect(
      matchesTarget(snapshot({ cursor: { line: 0, ch: 2 } }), {
        text: 'abc',
        cursor: { line: 0, ch: 2 },
      }),
    ).toBe(true);
  });

  it('checks the selection only when the target declares one', () => {
    expect(
      matchesTarget(snapshot(), {
        text: 'abc',
        selection: { anchor: { line: 0, ch: 0 }, head: { line: 0, ch: 2 } },
      }),
    ).toBe(false);
    expect(
      matchesTarget(
        snapshot({ selection: { anchor: { line: 0, ch: 0 }, head: { line: 0, ch: 2 } } }),
        { text: 'abc', selection: { anchor: { line: 0, ch: 0 }, head: { line: 0, ch: 2 } } },
      ),
    ).toBe(true);
  });

  it('ignores a snapshot selection when the target does not declare one', () => {
    expect(
      matchesTarget(
        snapshot({ selection: { anchor: { line: 0, ch: 0 }, head: { line: 0, ch: 2 } } }),
        { text: 'abc' },
      ),
    ).toBe(true);
  });

  it('requires no selection when the target explicitly asks for null', () => {
    expect(
      matchesTarget(
        snapshot({ selection: { anchor: { line: 0, ch: 0 }, head: { line: 0, ch: 2 } } }),
        { text: 'abc', selection: null },
      ),
    ).toBe(false);
  });
});

describe('evaluateChallenge', () => {
  it('only completes in normal mode', () => {
    const challenge = makeChallenge();
    expect(evaluateChallenge(challenge, snapshot({ mode: 'insert' }))).toEqual({
      pass: false,
      reason: 'mode',
    });
    expect(evaluateChallenge(challenge, snapshot({ mode: 'visual' }))).toEqual({
      pass: false,
      reason: 'mode',
    });
    expect(evaluateChallenge(challenge, snapshot())).toEqual({ pass: true, reason: 'pass' });
  });

  it('reports a mismatch when the buffer is wrong', () => {
    expect(evaluateChallenge(makeChallenge(), snapshot({ lines: ['abd'] }))).toEqual({
      pass: false,
      reason: 'mismatch',
    });
  });

  it('supports a pure validate predicate', () => {
    const challenge = makeChallenge({
      target: undefined,
      validate: (state) => state.cursor.ch === 0,
    });
    expect(evaluateChallenge(challenge, snapshot())).toEqual({ pass: true, reason: 'pass' });
    expect(evaluateChallenge(challenge, snapshot({ cursor: { line: 0, ch: 1 } }))).toEqual({
      pass: false,
      reason: 'mismatch',
    });
  });

  it('rejects challenges with both or neither target and validate', () => {
    const both = makeChallenge({ validate: () => true });
    const neither = makeChallenge({ target: undefined });
    expect(evaluateChallenge(both, snapshot()).reason).toBe('invalid-challenge');
    expect(evaluateChallenge(neither, snapshot()).reason).toBe('invalid-challenge');
  });
});

describe('challengeProblems', () => {
  it('accepts a well-formed challenge', () => {
    expect(challengeProblems(makeChallenge())).toEqual([]);
    expect(isValidChallenge(makeChallenge())).toBe(true);
  });

  it('rejects empty ids', () => {
    expect(challengeProblems(makeChallenge({ id: '' }))).toContain('id must be a non-empty string');
  });

  it('rejects unknown groups', () => {
    expect(challengeProblems(makeChallenge({ group: 'Z' as never }))).toContain(
      'group must be one of A–F',
    );
  });

  it('rejects out-of-range difficulty and non-integer order', () => {
    expect(challengeProblems(makeChallenge({ difficulty: 9 as never }))).toContain(
      'difficulty must be between 1 and 5',
    );
    expect(challengeProblems(makeChallenge({ order: 1.5 }))).toContain('order must be an integer');
  });

  it('rejects positions outside the buffer', () => {
    expect(
      challengeProblems(makeChallenge({ initial: { text: 'abc', cursor: { line: 0, ch: 4 } } })),
    ).toContain('initial.cursor is outside the buffer');
    expect(
      challengeProblems(makeChallenge({ initial: { text: 'abc', cursor: { line: 1, ch: 0 } } })),
    ).toContain('initial.cursor is outside the buffer');
    expect(
      challengeProblems(makeChallenge({ target: { text: 'abc', cursor: { line: 0, ch: 9 } } })),
    ).toContain('target.cursor is outside the target buffer');
  });

  it('rejects commands outside the universe', () => {
    expect(challengeProblems(makeChallenge({ targetCommand: 'zzz' }))).toContain(
      'targetCommand "zzz" is outside the universe',
    );
  });

  it('rejects non-positive pars', () => {
    expect(challengeProblems(makeChallenge({ par: { keystrokes: 0, seconds: 5 } }))).toContain(
      'par.keystrokes and par.seconds must be positive numbers',
    );
  });

  it('requires exactly one of target and validate', () => {
    expect(challengeProblems(makeChallenge({ validate: () => true }))).toContain(
      'exactly one of target and validate is required',
    );
    expect(challengeProblems(makeChallenge({ target: undefined }))).toContain(
      'exactly one of target and validate is required',
    );
  });

  it('rejects a challenge whose initial state already matches the target', () => {
    expect(
      challengeProblems(
        makeChallenge({
          initial: { text: 'abc', cursor: { line: 0, ch: 0 } },
          target: { text: 'abc' },
        }),
      ),
    ).toContain('initial state already matches target');
  });

  it('rejects malformed history seeds', () => {
    expect(
      challengeProblems(
        makeChallenge({
          initial: {
            text: 'ab',
            cursor: { line: 0, ch: 0 },
            historySeed: { text: 'ab', mode: 'undo' },
          },
        }),
      ),
    ).toContain('historySeed.text must differ from initial.text');

    expect(
      challengeProblems(
        makeChallenge({
          initial: {
            text: 'ab',
            cursor: { line: 0, ch: 0 },
            historySeed: { text: 'abc', mode: 'sideways' as never },
          },
        }),
      ),
    ).toContain('historySeed.mode must be "undo" or "redo"');
  });

  it('rejects a cursor that does not fit the history seed', () => {
    expect(
      challengeProblems(
        makeChallenge({
          initial: {
            text: 'abXc',
            cursor: { line: 0, ch: 4 },
            historySeed: { text: 'abc', mode: 'undo' },
          },
          target: { text: 'abc' },
        }),
      ),
    ).toContain('initial.cursor is outside historySeed.text');
  });

  it('reports malformed challenges instead of throwing', () => {
    expect(() => challengeProblems({} as never)).not.toThrow();
    expect(challengeProblems({} as never).length).toBeGreaterThan(0);
    expect(challengeProblems(makeChallenge({ initial: undefined as never }))).toContain(
      'initial.text is required',
    );
    expect(isValidChallenge({} as never)).toBe(false);
  });

  it('rejects half-formed selections', () => {
    expect(
      challengeProblems(makeChallenge({ target: { text: 'abc', selection: {} as never } })),
    ).toContain('target.selection is outside the target buffer');

    expect(
      challengeProblems(
        makeChallenge({
          initial: { text: 'abc', cursor: { line: 0, ch: 0 }, selection: {} as never },
        }),
      ),
    ).toContain('initial.selection is outside the buffer');
  });
});
