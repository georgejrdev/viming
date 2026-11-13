# viming — notes

`viming` is a practice site for developers who already use Vim but stay inside a small set of commands. Instead of reading a list, you edit a buffer until it matches a target state.

## How a session works

1. The app opens on the last challenge you visited, or the first one.
2. The editor is focused automatically. The clock starts on your first keystroke.
3. Every state change is validated. When the buffer, cursor and selection match the goal **in normal mode**, the challenge completes and the result appears.
4. Use the sidebar to pick a group, the arrows to move between challenges, or the random button to train recognition.

`Alt+←` goes to the previous challenge, `Alt+R` restarts the current one and `Alt+→` advances — the shortcuts are printed on the buttons and work even while the editor is focused.

## What counts as a solution

Only the final state matters. If your sequence reaches the goal, it passes — even if it is not the sequence the author had in mind. That is why the goal preview shows the exact buffer and cursor.

The timer stops at the moment of completion. Results show keystrokes, seconds, and the difference from the challenge par. Your best result per challenge is kept.

## Language and data

The interface is available in English and pt-BR. The first visit follows the browser language (`pt*` opens in pt-BR, everything else in English); a saved choice wins. “Reset data” clears the language preference, the last challenge and all results.

Everything runs locally. There is no backend, no account and no telemetry. Progress lives in `localStorage`; if the browser blocks it, the session still works from memory.

## Command coverage

The closed universe has 114 commands across six groups, with at least one challenge per command and at least two for `d`, `c`, `y` and the core motions. See `docs/spec/SPEC.md` for the full list and the implementation amendments (folds and `:g` were removed during construction).

## Running and verifying

See the top-level [README](../../README.md) for commands and project layout.

## License

AGPL-3.0. See [LICENSE](../../LICENSE).
