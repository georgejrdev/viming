import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { history, undo } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, drawSelection, highlightActiveLine, lineNumbers } from '@codemirror/view';
import { getCM, Vim, vim } from '@replit/codemirror-vim';
import type { InitialState, Position, Snapshot, VimMode } from '../core/challenge.model';
import { normalizeSelection } from '../core/challenge.validate';
import { registerExCommands } from './vim-ex';
import { installTagTextObjects } from './vim-tags';

export interface EditorStateEvent {
  snapshot: Snapshot;
  keystrokes: number;
  elapsedMs: number;
}

const BLOCKED_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
]);
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Dead']);

registerExCommands();
installTagTextObjects();

@Component({
  selector: 'app-editor',
  template: `<div #host class="editor-host" [attr.aria-label]="label()"></div>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .editor-host {
        height: 100%;
        overflow: hidden;
        border-radius: 0.75rem;
      }
    `,
  ],
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  readonly initial = input.required<InitialState>();
  readonly resetToken = input(0);
  readonly label = input('Vim practice editor');

  readonly stateChange = output<EditorStateEvent>();

  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');

  private view: EditorView | null = null;
  private startedAt: number | null = null;
  private stoppedAt: number | null = null;
  private keystrokes = 0;
  private frozen = false;
  private suppress = true;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly keydown = (event: KeyboardEvent) => this.onKeydown(event);
  private readonly blockMouse = (event: MouseEvent) => this.onMouse(event);

  private readonly extensions = [
    lineNumbers(),
    history(),
    indentUnit.of('    '),
    drawSelection(),
    highlightActiveLine(),
    EditorState.allowMultipleSelections.of(true),
    EditorView.contentAttributes.of({
      spellcheck: 'false',
      autocapitalize: 'off',
      autocomplete: 'off',
    }),
    EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '15px',
        backgroundColor: 'var(--editor-bg, #0f172a)',
        color: 'var(--editor-fg, #e2e8f0)',
      },
      '.cm-content': {
        fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace',
        padding: '0.75rem 0',
        caretColor: '#f8fafc',
      },
      '.cm-gutters': {
        backgroundColor: 'var(--editor-bg, #0f172a)',
        color: '#64748b',
        border: 'none',
      },
      '.cm-activeLine': { backgroundColor: 'rgba(148, 163, 184, 0.08)' },
      '.cm-activeLineGutter': { backgroundColor: 'rgba(148, 163, 184, 0.08)' },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
        backgroundColor: 'rgba(56, 189, 248, 0.25)',
      },
      '&.cm-focused': { outline: 'none' },
    }),
    vim({ status: false }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged || update.selectionSet) this.emitSnapshot();
    }),
  ];

  constructor() {
    effect(() => {
      const initial = this.initial();
      this.resetToken();
      if (this.view) this.applyInitial(initial);
    });
  }

  ngAfterViewInit(): void {
    const view = new EditorView({
      state: this.createState(this.initial()),
      parent: this.host().nativeElement,
    });
    this.view = view;
    view.dom.addEventListener('keydown', this.keydown, true);
    view.dom.addEventListener('mousedown', this.blockMouse, true);
    view.dom.addEventListener('dblclick', this.blockMouse, true);
    view.dom.addEventListener('dragstart', this.blockMouse, true);
    this.applyInitial(this.initial());
    queueMicrotask(() => this.focus());
  }

  ngOnDestroy(): void {
    this.stopTimer();
    const view = this.view;
    if (!view) return;
    view.dom.removeEventListener('keydown', this.keydown, true);
    view.dom.removeEventListener('mousedown', this.blockMouse, true);
    view.dom.removeEventListener('dblclick', this.blockMouse, true);
    view.dom.removeEventListener('dragstart', this.blockMouse, true);
    view.destroy();
    this.view = null;
  }

  focus(): void {
    this.view?.focus();
  }

  /** Freezes the clock at the moment the challenge is completed (AC-22). */
  freeze(): void {
    if (this.frozen) return;
    this.frozen = true;
    if (this.startedAt !== null) this.stoppedAt = performance.now();
    this.stopTimer();
  }

  private createState(initial: InitialState): EditorState {
    const anchor = this.offsetOf(initial.text, initial.cursor);
    const head = initial.selection ? this.offsetOf(initial.text, initial.selection.head) : anchor;
    const selectionAnchor = initial.selection
      ? this.offsetOf(initial.text, initial.selection.anchor)
      : anchor;
    return EditorState.create({
      doc: initial.text,
      selection: { anchor: selectionAnchor, head: initial.selection ? head : anchor },
      extensions: this.extensions,
    });
  }

  private applyInitial(initial: InitialState): void {
    const view = this.view;
    if (!view) return;

    this.suppress = true;
    this.stopTimer();
    this.frozen = false;
    this.startedAt = null;
    this.stoppedAt = null;
    this.keystrokes = 0;

    // Vim bookmarks (jump list, marks) keep offsets from the previous buffer.
    // `setState` does not notify them, so a stale offset larger than the new
    // document makes vim throw on the next motion. Detach them before swap.
    this.clearVimMarkers();

    const seed = initial.historySeed;
    const startText = seed ? (seed.mode === 'undo' ? seed.text : initial.text) : initial.text;
    const endText = seed ? (seed.mode === 'undo' ? initial.text : seed.text) : initial.text;
    const startCursor = this.offsetOf(startText, initial.cursor);

    view.setState(
      EditorState.create({
        doc: startText,
        selection: { anchor: startCursor },
        extensions: this.extensions,
      }),
    );

    if (seed) {
      view.dispatch({
        changes: { from: 0, to: startText.length, insert: endText },
        selection: { anchor: this.offsetOf(endText, initial.cursor) },
      });
      if (seed.mode === 'redo') undo(view);
    }

    const cursor = initial.cursor;
    queueMicrotask(() => {
      const cm = getCM(view);
      if (cm) {
        // The vim state lives on the CodeMirror adapter, which survives
        // `setState`. Escape clears any pending operator, count or multi-key
        // status left over from the previous challenge.
        Vim.handleKey(cm, '<Esc>', 'user');
        if (initial.selection) {
          cm.setSelection(initial.selection.anchor, initial.selection.head);
        } else {
          cm.setCursor(cursor.line, cursor.ch);
        }
        cm.focus();
      } else {
        view.focus();
      }
      this.suppress = false;
      this.emitSnapshot();
    });
  }

  private onKeydown(event: KeyboardEvent): void {
    if (BLOCKED_KEYS.has(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Ctrl+R and Ctrl+V are handled by codemirror-vim, which calls
    // preventDefault itself, so the browser does not reload or paste.
    if (MODIFIER_KEYS.has(event.key)) return;
    // IME composition must not start the clock or count as keystrokes.
    if (event.isComposing || event.keyCode === 229) return;
    if (this.frozen) return;

    if (this.startedAt === null) {
      this.startedAt = performance.now();
      this.startTimer();
    }
    this.keystrokes += 1;
    queueMicrotask(() => this.emitSnapshot());
  }

  private onMouse(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.focus();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => this.emitSnapshot(), 100);
  }

  private stopTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private elapsedMs(): number {
    if (this.startedAt === null) return 0;
    return (this.stoppedAt ?? performance.now()) - this.startedAt;
  }

  private emitSnapshot(): void {
    if (this.suppress) return;
    const view = this.view;
    if (!view) return;
    const snapshot = this.snapshot(view);
    const host = this.host().nativeElement;
    host.dataset['cursor'] = `${snapshot.cursor.line}:${snapshot.cursor.ch}`;
    host.dataset['mode'] = snapshot.mode;
    host.dataset['keystrokes'] = String(this.keystrokes);
    this.stateChange.emit({
      snapshot,
      keystrokes: this.keystrokes,
      elapsedMs: this.elapsedMs(),
    });
  }

  private snapshot(view: EditorView): Snapshot {
    const doc = view.state.doc;
    const lines = Array.from({ length: doc.lines }, (_, index) => doc.line(index + 1).text);
    const main = view.state.selection.main;

    let mode: VimMode = 'normal';
    const cm = getCM(view);
    const vimState = cm?.state.vim;
    if (vimState) {
      if (vimState.visualBlock) mode = 'visual-block';
      else if (vimState.visualLine) mode = 'visual-line';
      else if (vimState.visualMode) mode = 'visual';
      else if (vimState.insertMode) mode = cm?.state.overwrite ? 'replace' : 'insert';
      else if (vimState.exMode) mode = 'ex';
    }

    const position = (offset: number): Position => {
      const line = doc.lineAt(offset);
      return { line: line.number - 1, ch: offset - line.from };
    };

    return {
      lines,
      cursor: position(main.head),
      selection: normalizeSelection(
        main.anchor === main.head
          ? null
          : { anchor: position(main.anchor), head: position(main.head) },
      ),
      mode,
    };
  }

  private clearVimMarkers(): void {
    const view = this.view;
    if (!view) return;
    const cm = getCM(view) as unknown as {
      marks?: Record<string, { offset: number | null }>;
    } | null;
    if (!cm?.marks) return;
    for (const marker of Object.values(cm.marks)) {
      marker.offset = null;
    }
  }

  private offsetOf(text: string, position: Position): number {
    const lines = text.split('\n');
    let offset = 0;
    for (let line = 0; line < Math.min(position.line, lines.length); line += 1) {
      offset += lines[line].length + 1;
    }
    return offset + position.ch;
  }
}
