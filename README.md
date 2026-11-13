# viming

A small, local-first trainer for the Vim commands you know but never use. You get a buffer, a goal, and a clock; the app tells you when the buffer matches the goal — and how many keystrokes it took.

- Static Angular app. No backend, no accounts, no network calls at runtime.
- 124 challenges across six groups (fundamentals, operators and text objects, search and jumps, visual mode and registers, macros and marks, ex commands).
- Validated by the **final editor state**, so any correct sequence passes — not just the one used to author the challenge.
- Keyboard-first: `Alt+←` previous, `Alt+R` restart, `Alt+→` next — shown on the buttons and captured globally, so they work while the editor has focus.
- Bilingual (English / pt-BR) with runtime switching; the browser locale is the default and a saved choice wins.
- Progress, language and best results persist in `localStorage`, with defensive fallbacks when storage is blocked.

## Requirements

- Node.js `^22.22.3 || ^24.15.0 || >=26`
- npm

## Run

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Verify

```bash
npm run lint          # ESLint
npx tsc --noEmit -p tsconfig.app.json
npm test              # Vitest + jsdom
npm run build         # production bundle
npm run e2e           # Playwright against the dev server
```

Playwright needs its browsers once:

```bash
npx playwright install chromium firefox webkit
```

On Debian/Ubuntu also run `sudo npx playwright install-deps` once. On hosts where the WebKit bundle's Ubuntu libraries are missing (Arch, for example), the browser exits with `libicudata.so.74: cannot open shared object file`; extracting the matching libraries into a temporary directory and injecting them with `LD_PRELOAD` works without touching the system. The exact command, and the reasoning behind it, is recorded in `docs/spec/Kickoff.md`.

## Project layout

```text
src/app/
  core/         challenge model, command catalog, validation, scoring, storage, registry
  challenges/   .js challenge modules (group-a.js … group-f.js)
  editor/       CodeMirror 6 + codemirror-vim wrapper, custom ex commands, tag objects
  i18n/         en.ts, pt-BR.ts, language service
  app.ts/html/css   single-page shell
e2e/            Playwright specs
docs/spec/      specification and decision log (pt-BR)
docs/design/    interface design overview and UI decisions (pt-BR)
docs/for_peoples/  human-facing notes (en, pt-BR)
```

Challenges are plain `.js` modules imported by the app; there is no JSON fetch and no content endpoint.

## Documentation

- [Specification](docs/spec/SPEC.md) and [decision log](docs/spec/Kickoff.md) — in Portuguese.
- [Interface design](docs/design/design.md) — overview, visual system and UI decisions (Portuguese).
- [English notes](docs/for_peoples/en.md)
- [Notas em português](docs/for_peoples/pt-BR.md)

## License

[AGPL-3.0](LICENSE).
