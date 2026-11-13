import { computed, effect, inject, Injectable, signal } from '@angular/core';
import type { Language } from '../core/challenge.model';
import { StorageService } from '../core/storage.service';
import { en } from './en';
import type { Dictionary } from './en';
import { ptBR } from './pt-BR';

const DICTIONARIES = {
  en,
  'pt-BR': ptBR,
} as const;

/** pt* opens in pt-BR; every other locale falls back to English (R22). */
export function detectLanguage(locale: string | null | undefined): Language {
  return locale && /^pt\b/i.test(locale) ? 'pt-BR' : 'en';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storage = inject(StorageService);

  readonly lang = signal<Language>(this.initialLanguage());
  readonly dictionary = computed<Dictionary>(() => DICTIONARIES[this.lang()] as Dictionary);

  constructor() {
    effect(() => {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = this.lang();
      }
    });
  }

  setLanguage(language: Language): void {
    this.lang.set(language);
    const settings = this.storage.loadSettings();
    this.storage.saveSettings({ ...settings, lang: language });
  }

  /** Used by "reset data": back to the browser default without persisting. */
  resetToBrowserDefault(): void {
    this.lang.set(this.defaultLanguage());
  }

  defaultLanguage(): Language {
    const nav = typeof navigator === 'undefined' ? undefined : navigator;
    return detectLanguage(nav?.languages?.[0] ?? nav?.language);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const template = this.dictionary()[key] ?? key;
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match: string, name: string) =>
      params[name] !== undefined ? String(params[name]) : match,
    );
  }

  private initialLanguage(): Language {
    const stored = this.storage.loadSettings().lang;
    if (stored) return stored;
    return this.defaultLanguage();
  }
}
