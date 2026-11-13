import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, RESULTS_KEY, SETTINGS_KEY, StorageService } from './storage.service';

describe('StorageService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts with empty defaults', () => {
    const storage = new StorageService();
    expect(storage.storageAvailable).toBe(true);
    expect(storage.loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(storage.loadResults()).toEqual({});
  });

  it('round-trips settings', () => {
    const storage = new StorageService();
    storage.saveSettings({ lang: 'pt-BR', lastChallengeId: 'b-03-c' });
    expect(JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? '{}')).toEqual({
      lang: 'pt-BR',
      lastChallengeId: 'b-03-c',
    });
    expect(storage.loadSettings()).toEqual({ lang: 'pt-BR', lastChallengeId: 'b-03-c' });
  });

  it('drops unknown languages and empty ids', () => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ lang: 'fr', lastChallengeId: '' }));
    const storage = new StorageService();
    expect(storage.loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips results', () => {
    const storage = new StorageService();
    storage.saveResult('a-01-h', { bestKeystrokes: 1, bestSeconds: 2.5, attempts: 3 });
    expect(storage.loadResults()).toEqual({
      'a-01-h': { bestKeystrokes: 1, bestSeconds: 2.5, attempts: 3 },
    });
    expect(JSON.parse(window.localStorage.getItem(RESULTS_KEY) ?? '{}')).toEqual({
      'a-01-h': { bestKeystrokes: 1, bestSeconds: 2.5, attempts: 3 },
    });
  });

  it('keeps several results', () => {
    const storage = new StorageService();
    storage.saveResult('a', { bestKeystrokes: 1, bestSeconds: 1, attempts: 1 });
    storage.saveResult('b', { bestKeystrokes: 2, bestSeconds: 2, attempts: 1 });
    expect(Object.keys(storage.loadResults()).sort()).toEqual(['a', 'b']);
  });

  it('tolerates malformed JSON', () => {
    window.localStorage.setItem(SETTINGS_KEY, '{not json');
    window.localStorage.setItem(RESULTS_KEY, '<<<');
    const storage = new StorageService();
    expect(storage.loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(storage.loadResults()).toEqual({});
  });

  it('filters invalid result entries', () => {
    window.localStorage.setItem(
      RESULTS_KEY,
      JSON.stringify({
        good: { bestKeystrokes: 1, bestSeconds: 2, attempts: 1 },
        negative: { bestKeystrokes: -1, bestSeconds: 2, attempts: 1 },
        fractional: { bestKeystrokes: 1, bestSeconds: 2, attempts: 1.5 },
        missing: { bestKeystrokes: 1 },
        array: [],
      }),
    );
    const storage = new StorageService();
    expect(Object.keys(storage.loadResults())).toEqual(['good']);
  });

  it('ignores prototype-polluting keys', () => {
    window.localStorage.setItem(
      RESULTS_KEY,
      '{"__proto__":{"bestKeystrokes":1,"bestSeconds":1,"attempts":1},"constructor":{"bestKeystrokes":1,"bestSeconds":1,"attempts":1},"ok":{"bestKeystrokes":2,"bestSeconds":2,"attempts":2}}',
    );
    const storage = new StorageService();
    const results = storage.loadResults();
    expect(Object.keys(results)).toEqual(['ok']);
    expect(Object.getPrototypeOf(results)).toBe(Object.prototype);
  });

  it('resets both keys', () => {
    const storage = new StorageService();
    storage.saveSettings({ lang: 'en', lastChallengeId: 'a-01-h' });
    storage.saveResult('a-01-h', { bestKeystrokes: 1, bestSeconds: 1, attempts: 1 });
    storage.reset();
    expect(storage.loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(storage.loadResults()).toEqual({});
    expect(window.localStorage.getItem(SETTINGS_KEY)).toBeNull();
    expect(window.localStorage.getItem(RESULTS_KEY)).toBeNull();
  });

  it('degrades to memory when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const storage = new StorageService();
    expect(storage.storageAvailable).toBe(false);
    storage.saveSettings({ lang: 'en', lastChallengeId: 'a-01-h' });
    expect(storage.loadSettings()).toEqual({ lang: 'en', lastChallengeId: 'a-01-h' });

    storage.saveResult('a-01-h', { bestKeystrokes: 1, bestSeconds: 1, attempts: 1 });
    expect(storage.loadResults()).toEqual({
      'a-01-h': { bestKeystrokes: 1, bestSeconds: 1, attempts: 1 },
    });

    storage.reset();
    expect(storage.loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(storage.loadResults()).toEqual({});
  });

  it('keeps memory authoritative when a write fails after the probe', () => {
    const storage = new StorageService();
    expect(storage.storageAvailable).toBe(true);

    // Quota exceeded / private mode: the probe succeeded, later writes fail.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    storage.saveSettings({ lang: 'pt-BR', lastChallengeId: 'b-03-c' });
    storage.saveResult('a-01-h', { bestKeystrokes: 1, bestSeconds: 2, attempts: 1 });

    // Nothing reached localStorage, but the session must not lose the data.
    expect(window.localStorage.getItem(SETTINGS_KEY)).toBeNull();
    expect(window.localStorage.getItem(RESULTS_KEY)).toBeNull();
    expect(storage.loadSettings()).toEqual({ lang: 'pt-BR', lastChallengeId: 'b-03-c' });
    expect(storage.loadResults()).toEqual({
      'a-01-h': { bestKeystrokes: 1, bestSeconds: 2, attempts: 1 },
    });

    // A later read-modify-write must not clobber what only exists in memory.
    storage.saveResult('b-03-c', { bestKeystrokes: 2, bestSeconds: 3, attempts: 1 });
    expect(Object.keys(storage.loadResults()).sort()).toEqual(['a-01-h', 'b-03-c']);
  });
});
