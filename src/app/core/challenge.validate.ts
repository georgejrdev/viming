import { COMMAND_IDS } from './command.catalog';
import type {
  ChallengeDefinition,
  Position,
  SelectionState,
  Snapshot,
  TargetState,
} from './challenge.model';

/** Joins a CodeMirror document into the canonical text used by challenges. */
export function textFromLines(lines: readonly string[]): string {
  return lines.join('\n');
}

export function samePosition(a: Position, b: Position): boolean {
  return a.line === b.line && a.ch === b.ch;
}

export function normalizeSelection(
  selection: SelectionState | null | undefined,
): SelectionState | null {
  if (!selection?.anchor || !selection.head) return null;
  if (samePosition(selection.anchor, selection.head)) return null;
  return { anchor: { ...selection.anchor }, head: { ...selection.head } };
}

export function sameSelection(
  a: SelectionState | null | undefined,
  b: SelectionState | null | undefined,
): boolean {
  const left = normalizeSelection(a);
  const right = normalizeSelection(b);
  if (left === null || right === null) return left === right;
  return samePosition(left.anchor, right.anchor) && samePosition(left.head, right.head);
}

export function matchesTarget(snapshot: Snapshot, target: TargetState): boolean {
  if (textFromLines(snapshot.lines) !== target.text) return false;

  if (target.cursor && !samePosition(snapshot.cursor, target.cursor)) return false;

  // `selection` is diagnostic: absent means the target does not care about a
  // range, explicit `null` means the buffer must have no range.
  if (target.selection !== undefined && !sameSelection(snapshot.selection, target.selection)) {
    return false;
  }

  return true;
}

export type EvaluationReason = 'mode' | 'mismatch' | 'invalid-challenge' | 'pass';

export interface Evaluation {
  pass: boolean;
  reason: EvaluationReason;
}

/**
 * Pure evaluation of a challenge against an editor snapshot.
 *
 * Completion requires normal mode (SPEC R20 / AC-21). A target reached in
 * insert or visual mode is reported as `mode` so the UI can nudge the user
 * without completing the task.
 */
export function evaluateChallenge(challenge: ChallengeDefinition, snapshot: Snapshot): Evaluation {
  if (challenge.validate && challenge.target) {
    return { pass: false, reason: 'invalid-challenge' };
  }
  if (!challenge.validate && !challenge.target) {
    return { pass: false, reason: 'invalid-challenge' };
  }

  if (snapshot.mode !== 'normal') {
    return { pass: false, reason: 'mode' };
  }

  const pass = challenge.validate
    ? challenge.validate(snapshot) === true
    : matchesTarget(snapshot, challenge.target as TargetState);

  return { pass, reason: pass ? 'pass' : 'mismatch' };
}

const isFinitePositive = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

function lineAt(text: string, line: number): string | undefined {
  const lines = text.split('\n');
  return lines[line];
}

function positionFits(text: string | undefined, position: Position | undefined): boolean {
  if (!position) return true;
  if (typeof text !== 'string') return false;
  if (!isNonNegativeInteger(position.line) || !isNonNegativeInteger(position.ch)) return false;
  const line = lineAt(text, position.line);
  return line !== undefined && position.ch <= line.length;
}

function selectionFits(
  text: string | undefined,
  selection: SelectionState | null | undefined,
): boolean {
  if (!selection) return true;
  if (!selection.anchor || !selection.head) return false;
  return positionFits(text, selection.anchor) && positionFits(text, selection.head);
}

/** Offsets are computed the same way `EditorComponent.offsetOf` does. */
function cursorOffset(text: string, position: Position): number {
  const lines = text.split('\n');
  let offset = 0;
  for (let line = 0; line < Math.min(position.line, lines.length); line += 1) {
    offset += lines[line].length + 1;
  }
  return offset + position.ch;
}

/**
 * Structural integrity check used by the registry and its tests (AC-13).
 * Returns a list of human-readable problems; an empty list means valid.
 */
export function challengeProblems(challenge: ChallengeDefinition): string[] {
  try {
    return inspectChallenge(challenge);
  } catch {
    // Challenge modules are authored by hand; a malformed entry must be
    // reported instead of taking the whole registry down at import time.
    return ['challenge could not be validated'];
  }
}

function inspectChallenge(challenge: ChallengeDefinition): string[] {
  const problems: string[] = [];

  if (typeof challenge.id !== 'string' || challenge.id.trim() === '') {
    problems.push('id must be a non-empty string');
  }
  if (!['A', 'B', 'C', 'D', 'E', 'F'].includes(challenge.group)) {
    problems.push('group must be one of A–F');
  }
  if (!Number.isInteger(challenge.order)) {
    problems.push('order must be an integer');
  }
  if (![1, 2, 3, 4, 5].includes(challenge.difficulty)) {
    problems.push('difficulty must be between 1 and 5');
  }
  if (!challenge.titleKey) problems.push('titleKey is required');
  if (!challenge.taskKey) problems.push('taskKey is required');

  if (!challenge.initial || typeof challenge.initial.text !== 'string') {
    problems.push('initial.text is required');
  } else if (!challenge.initial.cursor) {
    problems.push('initial.cursor is required');
  } else if (!positionFits(challenge.initial.text, challenge.initial.cursor)) {
    problems.push('initial.cursor is outside the buffer');
  } else if (!selectionFits(challenge.initial.text, challenge.initial.selection)) {
    problems.push('initial.selection is outside the buffer');
  }

  const hasTarget = challenge.target != null;
  const hasValidate = typeof challenge.validate === 'function';
  if (hasTarget === hasValidate) {
    problems.push('exactly one of target and validate is required');
  }

  if (challenge.initial?.historySeed) {
    const seed = challenge.initial.historySeed;
    if (typeof seed.text !== 'string') {
      problems.push('historySeed.text must be a string');
    } else if (seed.text === challenge.initial.text) {
      problems.push('historySeed.text must differ from initial.text');
    } else if (
      challenge.initial.cursor &&
      cursorOffset(seed.text, challenge.initial.cursor) > seed.text.length
    ) {
      // The editor seeds the history with this text and places the cursor on
      // it, so a cursor that only fits the final buffer would throw.
      problems.push('initial.cursor is outside historySeed.text');
    }
    if (seed.mode !== 'undo' && seed.mode !== 'redo') {
      problems.push('historySeed.mode must be "undo" or "redo"');
    }
  }

  const initialText = challenge.initial?.text;
  if (challenge.target) {
    if (typeof challenge.target.text !== 'string') {
      problems.push('target.text must be a string');
    } else {
      if (
        challenge.target.cursor &&
        !positionFits(challenge.target.text, challenge.target.cursor)
      ) {
        problems.push('target.cursor is outside the target buffer');
      }
      if (!selectionFits(challenge.target.text, challenge.target.selection)) {
        problems.push('target.selection is outside the target buffer');
      }

      if (typeof initialText === 'string' && challenge.initial.cursor) {
        const initialSnapshot: Snapshot = {
          lines: initialText.split('\n'),
          cursor: challenge.initial.cursor,
          selection: normalizeSelection(challenge.initial.selection),
          mode: 'normal',
        };
        if (matchesTarget(initialSnapshot, challenge.target)) {
          problems.push('initial state already matches target');
        }
      }
    }
  }

  if (!COMMAND_IDS.has(challenge.targetCommand)) {
    problems.push(`targetCommand "${challenge.targetCommand}" is outside the universe`);
  }

  if (
    !challenge.par ||
    !isFinitePositive(challenge.par.keystrokes) ||
    !isFinitePositive(challenge.par.seconds)
  ) {
    problems.push('par.keystrokes and par.seconds must be positive numbers');
  }

  return problems;
}

export function isValidChallenge(challenge: ChallengeDefinition): boolean {
  return challengeProblems(challenge).length === 0;
}
