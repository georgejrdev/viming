import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { findChallenge } from './core/challenge.registry';
import { RESULTS_KEY } from './core/storage.service';

describe('App', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renders the brand and tagline', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('viming');
    expect(element.querySelector('.brand-copy p')?.textContent?.trim()).not.toBe('');
  });

  it('lists the six groups', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const letters = Array.from(element.querySelectorAll('.group-letter')).map((node) =>
      node.textContent?.trim(),
    );
    expect(letters).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('opens the first challenge with a goal preview', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.goal-text')?.textContent).toContain('abcdef');
    expect(element.querySelectorAll('.cm-content').length).toBe(1);
  });

  it('draws the goal caret at the target cursor', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const goal = element.querySelector('.goal-text');
    expect(goal?.querySelector('.goal-caret')).not.toBeNull();

    const spans = Array.from(goal?.querySelectorAll('span') ?? []).map(
      (node) => node.textContent ?? '',
    );
    // a-01-h ends at column 3 of `abcdef`, i.e. between `ab` and `cdef`.
    expect(spans).toEqual(['ab', '', 'cdef']);
  });

  it('moves the goal caret across lines', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const app = fixture.componentInstance as unknown as {
      selectChallenge(challenge: unknown): void;
    };

    app.selectChallenge(findChallenge('a-02-j'));
    fixture.detectChanges();

    const spans = Array.from(element.querySelectorAll('.goal-text span')).map(
      (node) => node.textContent ?? '',
    );
    // a-02-j wants the cursor on line 2, column 1.
    expect(spans).toEqual(['alpha\n', '', 'bravo\ncharlie']);
  });

  it('switches language from the header', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const [, ptButton] = Array.from(
      element.querySelectorAll<HTMLButtonElement>('.lang-switch button'),
    );
    ptButton.click();
    fixture.detectChanges();
    expect(element.querySelector('.sidebar')?.textContent).toContain('Fundamentos');
  });

  it('clears saved data on reset', async () => {
    window.localStorage.setItem(
      RESULTS_KEY,
      JSON.stringify({ 'a-01-h': { bestKeystrokes: 1, bestSeconds: 1, attempts: 1 } }),
    );
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const reset = Array.from(
      element.querySelectorAll<HTMLButtonElement>('.topbar-actions .ghost'),
    ).find((button) => !button.hasAttribute('aria-haspopup'));
    expect(reset).not.toBeNull();
    reset?.click();
    expect(window.localStorage.getItem(RESULTS_KEY)).toBeNull();
  });

  describe('challenge completion', () => {
    interface AppInternals {
      onStateChange(event: {
        snapshot: {
          lines: string[];
          cursor: { line: number; ch: number };
          selection: null;
          mode: string;
        };
        keystrokes: number;
        elapsedMs: number;
      }): void;
      modeWarning(): boolean;
      completed(): boolean;
      outcome(): { keystrokes: number } | null;
      current(): { id: string } | null;
      resetToken(): number;
    }

    function internals(app: App): AppInternals {
      return app as unknown as AppInternals;
    }

    function state(mode: string, ch: number, keystrokes = 1) {
      return {
        snapshot: {
          lines: ['abcdef'],
          cursor: { line: 0, ch },
          selection: null,
          mode,
        },
        keystrokes,
        elapsedMs: 1200,
      };
    }

    it('only warns about the mode when the goal is reached', async () => {
      const fixture = await render();
      const app = internals(fixture.componentInstance);

      // a-01-h starts at ch 3 and wants ch 2.
      app.onStateChange(state('insert', 3));
      expect(app.modeWarning()).toBe(false);
      expect(app.completed()).toBe(false);

      app.onStateChange(state('insert', 2));
      expect(app.modeWarning()).toBe(true);
      expect(app.completed()).toBe(false);

      app.onStateChange(state('normal', 2));
      expect(app.completed()).toBe(true);
      expect(app.modeWarning()).toBe(false);
      expect(app.outcome()?.keystrokes).toBe(1);
    });

    it('marks the goal box green once the challenge passes', async () => {
      const fixture = await render();
      const element = fixture.nativeElement as HTMLElement;
      const app = internals(fixture.componentInstance);

      expect(element.querySelector('.goal')?.classList.contains('success')).toBe(false);

      app.onStateChange(state('normal', 2));
      fixture.detectChanges();

      const goal = element.querySelector('.goal');
      expect(goal?.classList.contains('success')).toBe(true);
      expect(goal?.querySelector('.goal-help')?.textContent).toMatch(/complete|concluído/i);
      expect(goal?.querySelector('.goal-mark')).not.toBeNull();
    });

    it('warns inside the goal box when the goal is reached in the wrong mode', async () => {
      const fixture = await render();
      const element = fixture.nativeElement as HTMLElement;
      const app = internals(fixture.componentInstance);

      app.onStateChange(state('insert', 2));
      fixture.detectChanges();

      const goal = element.querySelector('.goal');
      expect(goal?.classList.contains('attention')).toBe(true);
      expect(goal?.classList.contains('success')).toBe(false);
      expect(goal?.querySelector('.goal-help')?.textContent).toMatch(/esc/i);
    });

    it('never completes before the first keystroke', async () => {
      const fixture = await render();
      const app = internals(fixture.componentInstance);

      app.onStateChange(state('normal', 2, 0));
      expect(app.completed()).toBe(false);
      expect(app.outcome()).toBeNull();
    });

    it('navigates and restarts with the Alt shortcuts', async () => {
      const fixture = await render();
      const app = internals(fixture.componentInstance);
      const first = app.current()?.id;
      expect(first).toBeTruthy();

      const press = (code: string, init: KeyboardEventInit = { altKey: true }) =>
        document.dispatchEvent(
          new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true, ...init }),
        );

      press('ArrowRight');
      expect(app.current()?.id).not.toBe(first);

      press('ArrowLeft');
      expect(app.current()?.id).toBe(first);

      const token = app.resetToken();
      press('KeyR');
      expect(app.resetToken()).toBe(token + 1);

      // Unmodified keys belong to the editor and must not navigate.
      press('KeyR', {});
      press('ArrowRight', {});
      expect(app.resetToken()).toBe(token + 1);
      expect(app.current()?.id).toBe(first);
    });
  });

  describe('statistics dialog', () => {
    it('opens with the saved progress and closes on Escape', async () => {
      window.localStorage.setItem(
        RESULTS_KEY,
        JSON.stringify({ 'a-01-h': { bestKeystrokes: 1, bestSeconds: 1, attempts: 1 } }),
      );
      const fixture = await render();
      const element = fixture.nativeElement as HTMLElement;

      expect(element.querySelector('.stats-dialog')).toBeNull();

      const statsButton = element.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]');
      statsButton?.click();
      fixture.detectChanges();

      const dialog = element.querySelector('.stats-dialog');
      expect(dialog?.getAttribute('role')).toBe('dialog');
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
      expect(dialog?.textContent).toMatch(/1 (of|de) 124/);
      expect(dialog?.textContent).toMatch(/group|grupo/i);

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
      fixture.detectChanges();
      expect(element.querySelector('.stats-dialog')).toBeNull();
    });

    it('keeps the Alt shortcuts inert while open', async () => {
      const fixture = await render();
      const element = fixture.nativeElement as HTMLElement;
      const app = fixture.componentInstance as unknown as { current(): { id: string } | null };
      const first = app.current()?.id;

      element.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')?.click();
      fixture.detectChanges();

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          code: 'ArrowRight',
          altKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
      expect(app.current()?.id).toBe(first);
    });
  });
});
