/**
 * Data contract for a challenge.
 *
 * A challenge module is language-neutral: it only carries positions, text and
 * i18n keys. The visible copy lives in `src/app/i18n`.
 */

export type GroupId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/** Curriculum order. Shared by the registry, the sidebar and the statistics. */
export const GROUP_IDS: readonly GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export type Difficulty = 1 | 2 | 3 | 4 | 5;

/**
 * Vim modes we can observe through codemirror-vim.
 *
 * `other` exists for ex dialogs and any future mode; only `normal` is allowed
 * to complete a challenge.
 */
export type VimMode =
  'normal' | 'insert' | 'replace' | 'visual' | 'visual-line' | 'visual-block' | 'ex' | 'other';

export interface Position {
  /** Zero-based line index. */
  line: number;
  /** Zero-based column index. */
  ch: number;
}

export interface SelectionState {
  anchor: Position;
  head: Position;
}

export interface Snapshot {
  lines: string[];
  cursor: Position;
  /** `null` when anchor and head are the same position. */
  selection: SelectionState | null;
  mode: VimMode;
}

export interface InitialState {
  text: string;
  cursor: Position;
  selection?: SelectionState | null;
  /**
   * Optional history used by undo/redo challenges. `undo` loads `text` as the
   * previous buffer and applies `initial.text`; `redo` applies `text` and then
   * undoes it, leaving a redo entry that restores `text`.
   */
  historySeed?: { text: string; mode: 'undo' | 'redo' };
}

export interface TargetState {
  text: string;
  cursor?: Position;
  selection?: SelectionState | null;
}

export interface Par {
  keystrokes: number;
  seconds: number;
}

export interface ChallengeDefinition {
  id: string;
  group: GroupId;
  order: number;
  difficulty: Difficulty;
  titleKey: string;
  taskKey: string;
  hintKey?: string;
  initial: InitialState;
  /** Exactly one of `target` and `validate` must be present. */
  target?: TargetState;
  /** Pure, deterministic predicate. Exactly one of `target` and `validate`. */
  validate?: (snapshot: Snapshot) => boolean;
  targetCommand: string;
  par: Par;
}

export interface ChallengeResult {
  bestKeystrokes: number;
  bestSeconds: number;
  attempts: number;
}

export type ResultsMap = Record<string, ChallengeResult>;

export type Language = 'en' | 'pt-BR';

export interface Settings {
  lang: Language | null;
  lastChallengeId: string | null;
}
