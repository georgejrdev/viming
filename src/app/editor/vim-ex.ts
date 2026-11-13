import { Vim } from '@replit/codemirror-vim';

/**
 * Ex commands that codemirror-vim does not ship with.
 *
 * The library only implements `:version`; the curriculum also needs `:s`,
 * `:m`, `:t` and `:normal`. They are registered here with `Vim.defineEx`.
 * `:%s` is just `:s` with a `%` range parsed by the library, so one handler
 * covers both catalog entries.
 */

interface CmPosition {
  line: number;
  ch: number;
}

interface ExEditor {
  getCursor(): CmPosition;
  setCursor(line: number, ch: number): void;
  getLine(line: number): string;
  lineCount(): number;
  lastLine(): number;
  firstLine(): number;
  getValue(): string;
  setValue(text: string): void;
  replaceRange(text: string, from: CmPosition, to?: CmPosition): void;
  operation<T>(fn: () => T): T;
  curOp?: { isVimOp?: boolean } | null;
}

interface ExParamsLike {
  argString?: string;
  selectionLine?: number;
  selectionLineEnd?: number;
}

let registered = false;

function splitSubstitute(input: string): [string, string, string] | null {
  if (!input) return null;
  const delimiter = input[0];
  const parts: string[] = [];
  let current = '';
  let escaped = false;

  for (const char of input.slice(1)) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      current += char;
      escaped = true;
      continue;
    }
    if (char === delimiter) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current);

  return [parts[0] ?? '', parts[1] ?? '', parts[2] ?? ''];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parses a Vim destination address into the 0-based line the range should be
 * inserted *after*. `-1` means "before the first line" (`:m0`).
 */
function parseAddress(arg: string, current: number, last: number): number | null {
  const value = arg.trim();
  if (value === '') return current;
  if (value === '$') return last;
  if (value === '.') return current;

  const offset = /^([+-])(\d*)$/.exec(value);
  if (offset) {
    const amount = offset[2] === '' ? 1 : Number(offset[2]);
    return offset[1] === '+' ? current + amount : current - amount;
  }

  if (/^\d+$/.test(value)) return Number(value) - 1;
  return null;
}

function replaceLine(cm: ExEditor, line: number, text: string): void {
  const old = cm.getLine(line);
  cm.replaceRange(text, { line, ch: 0 }, { line, ch: old.length });
}

function substitute(cm: ExEditor, params: ExParamsLike): void {
  const parsed = splitSubstitute(params.argString ?? '');
  if (!parsed) return;

  const [pattern, replacement, flags] = parsed;
  if (!pattern) return;

  const start = params.selectionLine ?? cm.getCursor().line;
  const end = params.selectionLineEnd ?? start;
  const from = Math.min(start, end);
  const to = Math.max(start, end);

  let expression: RegExp;
  try {
    expression = new RegExp(
      pattern,
      `${flags.includes('g') ? 'g' : ''}${flags.includes('i') ? 'i' : ''}`,
    );
  } catch {
    return;
  }

  cm.operation(() => {
    for (let line = from; line <= to; line += 1) {
      const next = cm.getLine(line).replace(expression, replacement);
      replaceLine(cm, line, next);
    }
    cm.setCursor(from, 0);
  });
}

function moveLines(cm: ExEditor, params: ExParamsLike, copy: boolean): void {
  const current = cm.getCursor().line;
  const start = Math.min(
    params.selectionLine ?? current,
    params.selectionLineEnd ?? params.selectionLine ?? current,
  );
  const end = Math.max(
    params.selectionLine ?? current,
    params.selectionLineEnd ?? params.selectionLine ?? current,
  );

  const target = parseAddress(params.argString ?? '', current, cm.lastLine());
  if (target === null) return;

  const lines = cm.getValue().split('\n');
  const range = lines.slice(start, end + 1);

  if (copy) {
    const insertAt = clamp(target + 1, 0, lines.length);
    const next = [...lines.slice(0, insertAt), ...range, ...lines.slice(insertAt)];
    cm.setValue(next.join('\n'));
    cm.setCursor(insertAt, 0);
    return;
  }

  if (target >= start && target <= end) return;

  const rest = [...lines.slice(0, start), ...lines.slice(end + 1)];
  const insertAt = target < start ? target + 1 : target - range.length + 1;
  const bounded = clamp(insertAt, 0, rest.length);
  const next = [...rest.slice(0, bounded), ...range, ...rest.slice(bounded)];
  cm.setValue(next.join('\n'));
  cm.setCursor(bounded, 0);
}

function decodeNormalKeys(input: string): string[] {
  const keys: string[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '<') {
      const match = /^<([A-Za-z][A-Za-z0-9-]*)>/.exec(input.slice(index));
      if (match) {
        keys.push(`<${match[1]}>`);
        index += match[0].length - 1;
        continue;
      }
    }
    keys.push(char === ' ' ? '<Space>' : char);
  }
  return keys;
}

function normal(cm: ExEditor, params: ExParamsLike): void {
  const keys = decodeNormalKeys((params.argString ?? '').trim());
  cm.operation(() => {
    for (const key of keys) {
      Vim.handleKey(cm as never, key, 'user');
    }
  });
}

export function registerExCommands(): void {
  if (registered) return;
  registered = true;

  Vim.defineEx('s', 's', (cm, params) => substitute(cm as unknown as ExEditor, params));
  Vim.defineEx('m', 'm', (cm, params) => moveLines(cm as unknown as ExEditor, params, false));
  Vim.defineEx('t', 't', (cm, params) => moveLines(cm as unknown as ExEditor, params, true));
  Vim.defineEx('normal', 'norm', (cm, params) => normal(cm as unknown as ExEditor, params));
}
