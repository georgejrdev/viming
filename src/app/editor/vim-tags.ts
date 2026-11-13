import { CodeMirror } from '@replit/codemirror-vim';
import type { Position } from '../core/challenge.model';

/**
 * codemirror-vim resolves `it`/`at` through a CodeMirror 5 hook that relies on
 * a syntax tree (`ensureSyntaxTree`). This editor is deliberately language
 * agnostic, so the hook always returns nothing and the text object is a no-op.
 *
 * We replace that hook with a small, dependency-free scanner over the buffer.
 * It is enough for the tag objects the curriculum uses and keeps the command
 * universe intact without pulling an HTML parser into the bundle.
 */
interface Adapter {
  getValue(): string;
  indexFromPos(position: Position): number;
  posFromIndex(offset: number): Position;
}

interface TagRange {
  from: Position;
  to: Position;
}

type TagHook = (cm: Adapter, position: Position) => { open: TagRange; close: TagRange } | null;

const TAG = /<([A-Za-z][\w:-]*)(?:[^<>]*)>[\s\S]*?<\/\1\s*>/g;

let installed = false;

export function installTagTextObjects(): void {
  if (installed) return;
  installed = true;

  const target = CodeMirror as unknown as { findEnclosingTag?: TagHook };

  target.findEnclosingTag = (cm, position) => {
    const text = cm.getValue();
    const offset = cm.indexFromPos(position);
    let best: { start: number; openEnd: number; closeStart: number; end: number } | null = null;
    let match: RegExpExecArray | null;

    TAG.lastIndex = 0;
    while ((match = TAG.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (offset < start || offset > end) continue;

      const openEnd = start + match[0].indexOf('>') + 1;
      const closeStart = start + match[0].lastIndexOf('</');
      if (!best || end - start < best.end - best.start) {
        best = { start, openEnd, closeStart, end };
      }
    }

    if (!best) return null;

    return {
      open: { from: cm.posFromIndex(best.start), to: cm.posFromIndex(best.openEnd) },
      close: { from: cm.posFromIndex(best.closeStart), to: cm.posFromIndex(best.end) },
    };
  };
}
