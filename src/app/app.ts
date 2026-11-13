import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  isDevMode,
  signal,
  viewChild,
} from '@angular/core';
import {
  CHALLENGES,
  GROUPS,
  challengesByGroup,
  findChallenge,
  firstChallenge,
  groupProgress,
  isPlayable,
  neighbours,
  pickRandomChallenge,
  playableChallenges,
} from './core/challenge.registry';
import type {
  ChallengeDefinition,
  ChallengeResult,
  GroupId,
  Language,
  ResultsMap,
} from './core/challenge.model';
import { evaluateChallenge } from './core/challenge.validate';
import { compareToPar, formatDelta, formatSeconds, mergeResult } from './core/scoring';
import type { Comparison } from './core/scoring';
import { buildStats } from './core/stats';
import type { Stats } from './core/stats';
import { StorageService } from './core/storage.service';
import { EditorComponent } from './editor/editor.component';
import type { EditorStateEvent } from './editor/editor.component';
import { LanguageService } from './i18n/language.service';

interface CompletedResult {
  keystrokes: number;
  elapsedMs: number;
  comparison: Comparison;
  best: ChallengeResult;
}

interface GroupView {
  id: GroupId;
  name: string;
  description: string;
  done: number;
  total: number;
}

@Component({
  selector: 'app-root',
  imports: [EditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly i18n = inject(LanguageService);
  private readonly storage = inject(StorageService);
  private readonly editor = viewChild(EditorComponent);
  private readonly statsClose = viewChild<ElementRef<HTMLButtonElement>>('statsClose');

  /** Restored when the statistics dialog closes. */
  private statsReturnFocus: HTMLElement | null = null;

  /**
   * Alt-based shortcuts, captured on the document so they work while the
   * editor owns the caret and vim never sees the keystroke. Escape closes the
   * statistics dialog, but stays untouched for vim when it is closed.
   */
  private readonly shortcuts = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.statsOpen()) {
      event.preventDefault();
      event.stopPropagation();
      this.closeStats();
      return;
    }

    // The dialog is modal: navigation and restart stay inert while it is open.
    if (this.statsOpen()) return;

    if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const action =
      event.code === 'ArrowLeft'
        ? 'previous'
        : event.code === 'ArrowRight'
          ? 'next'
          : event.code === 'KeyR'
            ? 'restart'
            : null;
    if (!action) return;

    event.preventDefault();
    event.stopPropagation();
    if (!this.current()) return;

    if (action === 'previous') this.previous();
    else if (action === 'next') this.next();
    else this.restart();
  };

  protected readonly results = signal<ResultsMap>({});
  protected readonly current = signal<ChallengeDefinition | null>(null);
  protected readonly event = signal<EditorStateEvent | null>(null);
  protected readonly completed = signal(false);
  protected readonly outcome = signal<CompletedResult | null>(null);
  protected readonly modeWarning = signal(false);
  protected readonly showHint = signal(false);
  protected readonly resetToken = signal(0);
  protected readonly toast = signal('');
  protected readonly storageAvailable = signal(this.storage.storageAvailable);
  protected readonly statsOpen = signal(false);

  protected readonly progress = computed(() => groupProgress(this.results()));

  /** Aggregated from the playable challenges, so stale ids never count. */
  protected readonly stats = computed(() => buildStats(playableChallenges(), this.results()));

  protected readonly groups = computed<GroupView[]>(() =>
    GROUPS.map((group) => ({
      id: group,
      name: this.i18n.t(`nav.group.${group}`),
      description: this.i18n.t(`nav.group.${group}.description`),
      done: this.progress()[group].done,
      total: this.progress()[group].total,
    })),
  );

  protected readonly currentGroupChallenges = computed<readonly ChallengeDefinition[]>(() => {
    const challenge = this.current();
    return challenge ? challengesByGroup(challenge.group) : [];
  });

  protected readonly neighbours = computed(() => neighbours(this.current()?.id ?? null));

  protected readonly targetText = computed(() => this.current()?.target?.text ?? null);
  protected readonly targetCursor = computed(() => this.current()?.target?.cursor ?? null);

  /**
   * The goal text split at the target cursor, so the preview can draw a caret
   * where the buffer is supposed to end up. Without it the only cue is the
   * `line, col` label in the corner, which users do not parse.
   */
  protected readonly goalPreview = computed<{ before: string; after: string } | null>(() => {
    const text = this.targetText();
    if (text === null) return null;

    const cursor = this.targetCursor();
    if (!cursor) return { before: text, after: '' };

    const lines = text.split('\n');
    let offset = 0;
    for (let line = 0; line < Math.min(cursor.line, lines.length); line += 1) {
      offset += lines[line].length + 1;
    }
    const clamped = Math.max(0, Math.min(offset + cursor.ch, text.length));
    return { before: text.slice(0, clamped), after: text.slice(clamped) };
  });

  protected readonly liveKeystrokes = computed(() => this.event()?.keystrokes ?? 0);
  protected readonly liveSeconds = computed(() => formatSeconds(this.event()?.elapsedMs ?? 0));

  protected readonly announcement = computed(() => {
    const result = this.outcome();
    if (result) {
      return `${this.i18n.t('result.pass')} ${this.i18n.t('result.keystrokes')}: ${result.keystrokes}. ${this.i18n.t(
        'result.time',
      )}: ${formatSeconds(result.elapsedMs)}s.`;
    }
    if (this.modeWarning()) return this.i18n.t('result.notNormal');
    return this.i18n.t('result.idle');
  });

  constructor() {
    const settings = this.storage.loadSettings();
    this.results.set(this.storage.loadResults());
    const initial = findChallenge(settings.lastChallengeId) ?? firstChallenge();
    if (initial) this.selectChallenge(initial, false);

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.shortcuts, true);
    }

    if (isDevMode()) {
      (
        globalThis as unknown as {
          __viming?: {
            challenges: readonly ChallengeDefinition[];
            select: (id: string) => void;
            snapshot: () => unknown;
          };
        }
      ).__viming = {
        challenges: CHALLENGES,
        select: (id: string) => {
          const challenge = findChallenge(id);
          if (challenge) this.selectChallenge(challenge);
        },
        snapshot: () => this.event()?.snapshot ?? null,
      };
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.shortcuts, true);
    }
  }

  protected selectChallenge(challenge: ChallengeDefinition, persist = true): void {
    if (!isPlayable(challenge)) return;
    this.current.set(challenge);
    this.event.set(null);
    this.completed.set(false);
    this.outcome.set(null);
    this.modeWarning.set(false);
    this.showHint.set(false);
    this.resetToken.update((token) => token + 1);

    if (persist) {
      this.storage.saveSettings({
        ...this.storage.loadSettings(),
        lastChallengeId: challenge.id,
      });
    }

    setTimeout(() => this.editor()?.focus(), 0);
  }

  protected selectGroup(group: GroupId): void {
    const challenges = challengesByGroup(group).filter(isPlayable);
    const next = challenges.find((challenge) => !this.results()[challenge.id]) ?? challenges[0];
    if (next) this.selectChallenge(next);
  }

  protected next(): void {
    const next = this.neighbours().next;
    if (next) this.selectChallenge(next);
  }

  protected previous(): void {
    const previous = this.neighbours().previous;
    if (previous) this.selectChallenge(previous);
  }

  protected random(): void {
    const challenge = pickRandomChallenge(this.current()?.id ?? null);
    if (challenge) this.selectChallenge(challenge);
  }

  protected restart(): void {
    const challenge = this.current();
    if (!challenge) return;
    this.event.set(null);
    this.completed.set(false);
    this.outcome.set(null);
    this.modeWarning.set(false);
    this.showHint.set(false);
    this.resetToken.update((token) => token + 1);
    setTimeout(() => this.editor()?.focus(), 0);
  }

  protected setLanguage(language: Language): void {
    this.i18n.setLanguage(language);
    setTimeout(() => this.editor()?.focus(), 0);
  }

  protected resetData(): void {
    this.storage.reset();
    this.results.set({});
    this.i18n.resetToBrowserDefault();
    this.toast.set(this.i18n.t('header.resetDone'));
    this.selectChallenge(firstChallenge() ?? CHALLENGES[0], false);
    setTimeout(() => {
      this.toast.set('');
      this.editor()?.focus();
    }, 3000);
  }

  protected openStats(): void {
    if (this.statsOpen()) return;
    if (typeof document !== 'undefined') {
      this.statsReturnFocus =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    this.statsOpen.set(true);
    setTimeout(() => this.statsClose()?.nativeElement.focus(), 0);
  }

  protected closeStats(): void {
    if (!this.statsOpen()) return;
    this.statsOpen.set(false);
    setTimeout(() => {
      const target = this.statsReturnFocus;
      this.statsReturnFocus = null;
      if (target && document.contains(target)) target.focus();
      else this.editor()?.focus();
    }, 0);
  }

  protected averageKeysLabel(stats: Stats): string {
    return stats.averageKeystrokes === null
      ? '—'
      : this.i18n.t('stats.keysValue', { keys: stats.averageKeystrokes.toFixed(1) });
  }

  protected averageSecondsLabel(stats: Stats): string {
    return stats.averageSeconds === null
      ? '—'
      : this.i18n.t('stats.secondsValue', { seconds: stats.averageSeconds.toFixed(1) });
  }

  protected keysLabel(value: number): string {
    return this.i18n.t('stats.keysValue', { keys: value });
  }

  protected secondsLabel(value: number): string {
    return this.i18n.t('stats.secondsValue', { seconds: value.toFixed(1) });
  }

  protected toggleHint(): void {
    this.showHint.update((value) => !value);
  }

  protected onStateChange(event: EditorStateEvent): void {
    this.event.set(event);
    const challenge = this.current();
    if (!challenge || this.completed() || event.keystrokes === 0) return;

    const evaluation = evaluateChallenge(challenge, event.snapshot);

    if (evaluation.reason === 'mode') {
      // Only nudge when the goal is already reached and the user just needs to
      // leave insert/visual mode; being in insert mode is not a warning by
      // itself.
      const normalModeProbe = evaluateChallenge(challenge, {
        ...event.snapshot,
        mode: 'normal',
      });
      this.modeWarning.set(normalModeProbe.pass);
      return;
    }

    this.modeWarning.set(false);
    if (!evaluation.pass) return;

    this.completed.set(true);
    this.editor()?.freeze();

    const attempt = { keystrokes: event.keystrokes, elapsedMs: event.elapsedMs };
    const best = mergeResult(this.results()[challenge.id], attempt);
    this.results.update((results) => ({ ...results, [challenge.id]: best }));
    this.storage.saveResult(challenge.id, best);

    this.outcome.set({
      keystrokes: event.keystrokes,
      elapsedMs: event.elapsedMs,
      comparison: compareToPar(challenge, attempt),
      best,
    });
  }

  protected isCompleted(challenge: ChallengeDefinition): boolean {
    return Boolean(this.results()[challenge.id]);
  }

  protected difficultyDots(value: number): string {
    return '●'.repeat(value) + '○'.repeat(5 - value);
  }

  protected keystrokeDelta(value: number): string {
    return formatDelta(value);
  }

  protected secondDelta(value: number): string {
    return formatDelta(value, 1);
  }

  protected challengeTitle(challenge: ChallengeDefinition): string {
    return this.i18n.t(challenge.titleKey);
  }

  protected parLabel(challenge: ChallengeDefinition): string {
    return this.i18n.t('task.parValue', {
      keystrokes: challenge.par.keystrokes,
      seconds: challenge.par.seconds,
    });
  }

  protected bestLabel(best: ChallengeResult): string {
    return this.i18n.t('result.bestValue', {
      keystrokes: best.bestKeystrokes,
      seconds: best.bestSeconds.toFixed(1),
    });
  }
}
