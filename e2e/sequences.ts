import type { Page } from '@playwright/test';

/**
 * Intended solutions, keyed by `<group><order>`.
 * `<Esc>`, `<Enter>`, `<Ctrl-r>` and `<Ctrl-v>` are sent as key presses; every
 * other character is typed and processed by codemirror-vim.
 */
export const SEQUENCES: Record<string, string> = {
  A1: 'h',
  A2: 'j',
  A3: 'k',
  A4: 'l',
  A5: 'w',
  A6: 'ww',
  A7: 'WW',
  A8: 'b',
  A9: 'bb',
  A10: 'B',
  A11: 'e',
  A12: 'ee',
  A13: 'E',
  A14: '0',
  A15: '0',
  A16: '^',
  A17: '$',
  A18: 'j$',
  A19: 'gg',
  A20: 'gg',
  A21: 'G',
  A22: '2G',
  A23: 'ge',
  A24: 'gE',
  A25: '3j',
  A26: 'iX<Esc>',
  A27: 'IX<Esc>',
  A28: 'aX<Esc>',
  A29: 'AX<Esc>',
  A30: 'oX<Esc>',
  A31: 'OX<Esc>',
  A32: 'x',
  A33: 'X',
  A34: 'rx',
  A35: 'sx<Esc>',
  A36: 'SX<Esc>',
  A37: 'CX<Esc>',
  A38: 'D',
  A39: 'Yp',
  A40: 'ylp',
  A41: 'ylP',
  A42: 'J',
  A43: 'u',
  A44: '<Ctrl-r>',
  A45: 'AX<Esc>j.j.',

  B1: 'dw',
  B2: 'd$',
  B3: 'cwX<Esc>',
  B4: 'c$X<Esc>',
  B5: 'yyp',
  B6: 'yyGp',
  B7: '>>',
  B8: '<<',
  B9: '==',
  B10: 'g~w',
  B11: 'guu',
  B12: 'gUU',
  B13: 'diw',
  B14: 'daw',
  B15: 'diW',
  B16: 'daW',
  B17: 'di"',
  B18: 'da"',
  B19: "di'",
  B20: "da'",
  B21: 'di(',
  B22: 'da(',
  B23: 'di[',
  B24: 'da[',
  B25: 'di{',
  B26: 'da{',
  B27: 'dip',
  B28: 'dap',
  B29: 'dit',
  B30: 'dat',
  B31: 'dd',
  B32: 'yyp',
  B33: 'ccX<Esc>',
  B34: 'ddp',
  B35: 'yyp',
  B36: 'ddkP',
  B37: 'ddjP',

  C1: '/alpha<Enter>',
  C2: '?beta<Enter>',
  C3: '/aa<Enter>nn',
  C4: '/aa<Enter>nnN',
  C5: '*',
  C6: '#',
  C7: 'fd',
  C8: 'Fc',
  C9: 'td',
  C10: 'Tc',
  C11: 'f-;',
  C12: 'f-;,',
  C13: '%',
  C14: '{',
  C15: '}',
  C16: '(',
  C17: ')',
  C18: 'H',
  C19: 'M',
  C20: 'L',

  D1: 'vlld',
  D2: 'Vjd',
  D3: '<Ctrl-v>jjld',
  D4: 'vllod',
  D5: '"ayy"ap',
  D6: 'yy"0p',
  D7: 'yyj"_ddp',
  D8: '"+yyp',
  D9: 'yy"*p',
  D10: '"ayyj"ap',
  D11: '"ayyj"aP',

  E1: 'qaAX<Esc>q',
  E2: 'qaAX<Esc>jq2@a',
  E3: 'qaAX<Esc>jq@a@@',
  E4: "Gmagg'a",
  E5: "Gmagg'a",
  E6: 'jllmagg`a',

  F1: ':s/foo/baz/<Enter>',
  F2: ':%s/foo/baz/g<Enter>',
  F3: ':m+1<Enter>',
  F4: ':t$<Enter>',
  F5: ':normal dd<Enter>',
};

export const SPECIAL: Record<string, string> = {
  Esc: 'Escape',
  Enter: 'Enter',
  'Ctrl-r': 'Control+r',
  'Ctrl-v': 'Control+v',
};

const TOKEN = /^<[A-Za-z-]+>$/;

export async function sendSequence(page: Page, sequence: string): Promise<void> {
  const parts = sequence.split(/(<[A-Za-z-]+>)/g).filter(Boolean);
  for (const part of parts) {
    if (TOKEN.test(part)) {
      const key = SPECIAL[part.slice(1, -1)];
      if (!key) throw new Error(`Unknown key token: ${part}`);
      await page.keyboard.press(key);
      await page.waitForTimeout(12);
    } else {
      // One key at a time: codemirror-vim needs a tick per key, otherwise
      // fast input can be routed through the text-input handler and inserted
      // literally (e.g. `G` becoming a character in the buffer).
      for (const key of part) {
        await page.keyboard.press(key === ' ' ? 'Space' : key);
        await page.waitForTimeout(12);
      }
    }
  }
}
