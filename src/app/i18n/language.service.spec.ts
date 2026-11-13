import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { COMMAND_CATALOG } from '../core/command.catalog';
import { StorageService } from '../core/storage.service';
import { en } from './en';
import { LanguageService, detectLanguage } from './language.service';
import { ptBR } from './pt-BR';

describe('detectLanguage', () => {
  it('opens pt-BR for Portuguese locales', () => {
    expect(detectLanguage('pt')).toBe('pt-BR');
    expect(detectLanguage('pt-BR')).toBe('pt-BR');
    expect(detectLanguage('pt-PT')).toBe('pt-BR');
    expect(detectLanguage('PT-br')).toBe('pt-BR');
  });

  it('falls back to English', () => {
    expect(detectLanguage('en')).toBe('en');
    expect(detectLanguage('en-US')).toBe('en');
    expect(detectLanguage('fr-FR')).toBe('en');
    expect(detectLanguage('')).toBe('en');
    expect(detectLanguage(null)).toBe('en');
    expect(detectLanguage(undefined)).toBe('en');
  });
});

describe('dictionaries', () => {
  it('have exactly the same keys', () => {
    expect(Object.keys(ptBR).sort()).toEqual(Object.keys(en).sort());
  });

  it('provide a title for every command', () => {
    for (const command of COMMAND_CATALOG) {
      const key = `title.cmd.${command.key}`;
      expect(en, key).toHaveProperty(key);
      expect(ptBR, key).toHaveProperty(key);
    }
  });

  it('have no empty translations', () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value.trim(), key).not.toBe('');
    }
    for (const [key, value] of Object.entries(ptBR)) {
      expect(value.trim(), key).not.toBe('');
    }
  });
});

describe('LanguageService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('defaults to English outside a Portuguese browser', () => {
    const service = TestBed.inject(LanguageService);
    expect(['en', 'pt-BR']).toContain(service.lang());
  });

  it('switches language and interpolates parameters', () => {
    const service = TestBed.inject(LanguageService);

    service.setLanguage('en');
    expect(service.t('task.parValue', { keystrokes: 4, seconds: 9 })).toBe('4 keys · 9s');

    service.setLanguage('pt-BR');
    expect(service.t('task.parValue', { keystrokes: 4, seconds: 9 })).toBe('4 teclas · 9s');
  });

  it('persists the chosen language', () => {
    const service = TestBed.inject(LanguageService);
    service.setLanguage('pt-BR');
    expect(TestBed.inject(StorageService).loadSettings().lang).toBe('pt-BR');
  });

  it('falls back to the key for unknown entries', () => {
    const service = TestBed.inject(LanguageService);
    expect(service.t('does.not.exist')).toBe('does.not.exist');
  });

  it('leaves unknown placeholders untouched', () => {
    const service = TestBed.inject(LanguageService);
    service.setLanguage('en');
    expect(service.t('task.parValue', { keystrokes: 2 })).toBe('2 keys · {seconds}s');
  });
});
