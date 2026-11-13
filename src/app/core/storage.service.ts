import { Injectable } from '@angular/core';
import type { ChallengeResult, Language, ResultsMap, Settings } from './challenge.model';

export const SETTINGS_KEY = 'viming:v1:settings';
export const RESULTS_KEY = 'viming:v1:results';

export const DEFAULT_SETTINGS: Settings = {
  lang: null,
  lastChallengeId: null,
};

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'pt-BR';
}

function parseSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS };
  const candidate = raw as Record<string, unknown>;
  return {
    lang: isLanguage(candidate['lang']) ? candidate['lang'] : null,
    lastChallengeId:
      typeof candidate['lastChallengeId'] === 'string' && candidate['lastChallengeId'].length > 0
        ? candidate['lastChallengeId']
        : null,
  };
}

function parseResult(raw: unknown): ChallengeResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, unknown>;
  const bestKeystrokes = candidate['bestKeystrokes'];
  const bestSeconds = candidate['bestSeconds'];
  const attempts = candidate['attempts'];

  if (
    typeof bestKeystrokes !== 'number' ||
    !Number.isFinite(bestKeystrokes) ||
    bestKeystrokes < 0 ||
    typeof bestSeconds !== 'number' ||
    !Number.isFinite(bestSeconds) ||
    bestSeconds < 0 ||
    typeof attempts !== 'number' ||
    !Number.isInteger(attempts) ||
    attempts < 0
  ) {
    return null;
  }

  return { bestKeystrokes, bestSeconds, attempts };
}

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function parseResults(raw: unknown): ResultsMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const results: ResultsMap = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(id)) continue;
    const parsed = parseResult(value);
    if (parsed) results[id] = parsed;
  }
  return results;
}

/**
 * Versioned, defensive localStorage access.
 *
 * Any failure (blocked storage, malformed JSON, unknown schema) degrades to an
 * in-memory session instead of throwing (AC-3, AC-15).
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private memorySettings: Settings = { ...DEFAULT_SETTINGS };
  private memoryResults: ResultsMap = {};
  private readonly available = this.probe();

  get storageAvailable(): boolean {
    return this.available;
  }

  loadSettings(): Settings {
    if (!this.available) return { ...this.memorySettings };
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      // A failed write leaves the key absent while memory holds the truth.
      if (!raw) return { ...this.memorySettings };
      this.memorySettings = parseSettings(JSON.parse(raw));
      return { ...this.memorySettings };
    } catch {
      return { ...this.memorySettings };
    }
  }

  saveSettings(settings: Settings): void {
    this.memorySettings = parseSettings(settings);
    if (!this.available) return;
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.memorySettings));
    } catch {
      // Storage became unavailable mid-session; memory remains authoritative.
    }
  }

  loadResults(): ResultsMap {
    if (!this.available) return { ...this.memoryResults };
    try {
      const raw = window.localStorage.getItem(RESULTS_KEY);
      // A failed write leaves the key absent while memory holds the truth.
      if (!raw) return { ...this.memoryResults };
      this.memoryResults = parseResults(JSON.parse(raw));
      return { ...this.memoryResults };
    } catch {
      return { ...this.memoryResults };
    }
  }

  saveResult(challengeId: string, result: ChallengeResult): void {
    const results = this.loadResults();
    results[challengeId] = result;
    this.memoryResults = results;
    if (!this.available) return;
    try {
      window.localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
    } catch {
      // Keep the in-memory copy.
    }
  }

  reset(): void {
    this.memorySettings = { ...DEFAULT_SETTINGS };
    this.memoryResults = {};
    if (!this.available) return;
    try {
      window.localStorage.removeItem(SETTINGS_KEY);
      window.localStorage.removeItem(RESULTS_KEY);
    } catch {
      // Nothing else to do.
    }
  }

  private probe(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const probeKey = 'viming:v1:probe';
      window.localStorage.setItem(probeKey, '1');
      window.localStorage.removeItem(probeKey);
      return true;
    } catch {
      return false;
    }
  }
}
