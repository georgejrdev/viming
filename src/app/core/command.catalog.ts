import type { GroupId } from './challenge.model';

/**
 * The closed command universe from SPEC §5.
 *
 * `key` is the stable i18n fragment: challenges use `title.cmd.<key>`.
 * `minChallenges` implements decision D26:
 *   - every command has at least one challenge;
 *   - `d`, `c`, `y` and the core motions have at least two.
 */
export interface CommandSpec {
  id: string;
  group: GroupId;
  label: string;
  key: string;
  minChallenges: number;
}

const cmd = (
  id: string,
  group: GroupId,
  key: string,
  minChallenges = 1,
  label = id,
): CommandSpec => ({ id, group, key, label, minChallenges });

export const COMMAND_CATALOG: readonly CommandSpec[] = [
  // A. Fundamentals
  cmd('h', 'A', 'h'),
  cmd('j', 'A', 'j'),
  cmd('k', 'A', 'k'),
  cmd('l', 'A', 'l'),
  cmd('w', 'A', 'w', 2),
  cmd('W', 'A', 'W'),
  cmd('b', 'A', 'b', 2),
  cmd('B', 'A', 'B'),
  cmd('e', 'A', 'e', 2),
  cmd('E', 'A', 'E'),
  cmd('0', 'A', 'zero', 2),
  cmd('^', 'A', 'caret'),
  cmd('$', 'A', 'dollar', 2),
  cmd('gg', 'A', 'gg', 2),
  cmd('G', 'A', 'G', 2),
  cmd('ge', 'A', 'ge'),
  cmd('gE', 'A', 'gE'),
  cmd('count', 'A', 'count'),
  cmd('i', 'A', 'i'),
  cmd('I', 'A', 'I'),
  cmd('a', 'A', 'a'),
  cmd('A', 'A', 'A'),
  cmd('o', 'A', 'o'),
  cmd('O', 'A', 'O'),
  cmd('x', 'A', 'x'),
  cmd('X', 'A', 'X'),
  cmd('r', 'A', 'r'),
  cmd('s', 'A', 's'),
  cmd('S', 'A', 'S'),
  cmd('C', 'A', 'C'),
  cmd('D', 'A', 'D'),
  cmd('Y', 'A', 'Y'),
  cmd('p', 'A', 'p'),
  cmd('P', 'A', 'P'),
  cmd('J', 'A', 'J'),
  cmd('u', 'A', 'u'),
  cmd('Ctrl-r', 'A', 'ctrl-r'),
  cmd('.', 'A', 'dot'),

  // B. Operators and text objects
  cmd('d', 'B', 'd', 2),
  cmd('c', 'B', 'c', 2),
  cmd('y', 'B', 'y', 2),
  cmd('>', 'B', 'indent'),
  cmd('<', 'B', 'dedent'),
  cmd('=', 'B', 'auto-indent'),
  cmd('g~', 'B', 'g-tilde'),
  cmd('gu', 'B', 'gu'),
  cmd('gU', 'B', 'gU'),
  cmd('iw', 'B', 'iw'),
  cmd('aw', 'B', 'aw'),
  cmd('iW', 'B', 'iW'),
  cmd('aW', 'B', 'aW'),
  cmd('i"', 'B', 'i-double-quote'),
  cmd('a"', 'B', 'a-double-quote'),
  cmd("i'", 'B', 'i-single-quote'),
  cmd("a'", 'B', 'a-single-quote'),
  cmd('i(', 'B', 'i-paren'),
  cmd('a(', 'B', 'a-paren'),
  cmd('i[', 'B', 'i-bracket'),
  cmd('a[', 'B', 'a-bracket'),
  cmd('i{', 'B', 'i-brace'),
  cmd('a{', 'B', 'a-brace'),
  cmd('ip', 'B', 'ip'),
  cmd('ap', 'B', 'ap'),
  cmd('it', 'B', 'it'),
  cmd('at', 'B', 'at'),
  cmd('dd', 'B', 'dd'),
  cmd('yy', 'B', 'yy'),
  cmd('cc', 'B', 'cc'),
  cmd('ddp', 'B', 'ddp'),
  cmd('yyp', 'B', 'yyp'),
  cmd('ddkP', 'B', 'ddkP'),
  cmd('ddjP', 'B', 'ddjP'),

  // C. Search and jumps
  cmd('/', 'C', 'search-forward', 1, '/'),
  cmd('?', 'C', 'search-backward', 1, '?'),
  cmd('n', 'C', 'n'),
  cmd('N', 'C', 'N'),
  cmd('*', 'C', 'star', 1, '*'),
  cmd('#', 'C', 'hash', 1, '#'),
  cmd('f', 'C', 'f'),
  cmd('F', 'C', 'F'),
  cmd('t', 'C', 't'),
  cmd('T', 'C', 'T'),
  cmd(';', 'C', 'semicolon', 1, ';'),
  cmd(',', 'C', 'comma', 1, ','),
  cmd('%', 'C', 'percent', 1, '%'),
  cmd('{', 'C', 'brace-back', 1, '{'),
  cmd('}', 'C', 'brace-forward', 1, '}'),
  cmd('(', 'C', 'paren-back', 1, '('),
  cmd(')', 'C', 'paren-forward', 1, ')'),
  cmd('H', 'C', 'H'),
  cmd('M', 'C', 'M'),
  cmd('L', 'C', 'L'),

  // D. Visual mode and registers
  cmd('v', 'D', 'v'),
  cmd('V', 'D', 'V'),
  cmd('Ctrl-v', 'D', 'ctrl-v'),
  cmd('o', 'D', 'visual-o', 1, 'o (visual)'),
  cmd('"a-"z', 'D', 'registers', 1, '"a–"z'),
  cmd('"0', 'D', 'register-zero', 1, '"0'),
  cmd('"_', 'D', 'register-blackhole', 1, '"_'),
  cmd('"+', 'D', 'register-clipboard', 1, '"+'),
  cmd('"*', 'D', 'register-selection', 1, '"*'),
  cmd('reg-p', 'D', 'reg-p', 1, '"x p'),
  cmd('reg-P', 'D', 'reg-P', 1, '"x P'),

  // E. Macros and marks (folds were removed by the implementation amendment)
  cmd('q', 'E', 'q'),
  cmd('@', 'E', 'at'),
  cmd('@@', 'E', 'at-at'),
  cmd('m', 'E', 'm'),
  cmd("'", 'E', 'tick', 1, "'"),
  cmd('`', 'E', 'backtick', 1, '`'),

  // F. Ex commands implemented on top of codemirror-vim
  cmd(':s', 'F', 'ex-s'),
  cmd(':%s', 'F', 'ex-percent-s'),
  cmd(':m', 'F', 'ex-m'),
  cmd(':t', 'F', 'ex-t'),
  cmd(':normal', 'F', 'ex-normal'),
];

export const COMMAND_IDS: ReadonlySet<string> = new Set(COMMAND_CATALOG.map((c) => c.id));

export const COMMAND_BY_ID: ReadonlyMap<string, CommandSpec> = new Map(
  COMMAND_CATALOG.map((c) => [c.id, c]),
);

export function titleKeyFor(commandId: string): string {
  const spec = COMMAND_BY_ID.get(commandId);
  return `title.cmd.${spec?.key ?? 'unknown'}`;
}

export function commandsByGroup(group: GroupId): readonly CommandSpec[] {
  return COMMAND_CATALOG.filter((c) => c.group === group);
}
