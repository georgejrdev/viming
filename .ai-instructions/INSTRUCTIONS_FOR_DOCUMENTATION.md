# INSTRUCTIONS FOR DOCUMENTATION

## SCOPE
These rules apply to every documentation file the AI creates, changes, moves, or deletes in this repository: the root README, the human-facing guides, and their translations.

## LANGUAGE POLICY
- The repository has exactly two documentation languages: English and Brazilian Portuguese (`pt-BR`).
- Everything addressed to a developer, a user, or a future reader is written in English: root README, source comments, commit messages, workflow names, branch names.
- Brazilian Portuguese appears only on the `pt-BR` side of `docs/for_peoples`.
- Conversation with the user follows the user's language; documentation does not. A task requested in Portuguese is still documented in English and translated to `pt-BR` in the same change.

## ROOT README
- There is exactly one `README.md` at the repository root, and it is written in English.
- Never create localized READMEs at the root (`README.pt-BR.md`, `README.pt.md`, `README.en.md`). Localization lives in `docs/for_peoples`.
- The first line of the file is the language switcher, the third is the project title:
  ```markdown
  English | [Português](docs/for_peoples/pt-BR/README.md)

  # Project name
  ```
- The root README is a summary, not the manual. It contains: the project name, one paragraph on what it is, the stack, the requirements, the install command, the shortest quickstart, and a Documentation section. Everything longer belongs to `docs/for_peoples`.
- The Documentation section links the guide in the README's own language, explicitly:
  ```markdown
  ## Documentation
  - [Full guide](docs/for_peoples/en/README.md)
  - [Installation](docs/for_peoples/en/installation.md)
  ```
- All links are relative and resolve from the file that contains them. Never link a file of this repository through an absolute `github.com` URL.

## FOR_PEOPLES STRUCTURE
```
docs/for_peoples/
├── assets/            # shared images and diagrams, language-neutral
├── en/
│   ├── README.md      # entry point and index of the English side
│   ├── installation.md
│   └── usage.md
└── pt-BR/
    ├── README.md      # entry point and index of the Portuguese side
    ├── installation.md
    └── usage.md
```
- The language folder is `en` or `pt-BR`. Never `pt`, `pt_br`, `pt_BR`, `br`, `english`, or a date.
- Each language folder contains a `README.md` that is both the entry point and the index of that language.
- File names are language-neutral and identical in both trees (`installation.md`, `usage.md`). The language lives in the folder, never in the file name.
- `docs/for_peoples/pt-BR/README.md` reproduces the content of the root README, translated, so switching language never loses information. It may add anything the English side has.
- Shared images and diagrams live once, in `docs/for_peoples/assets/`, and are referenced from both languages. Never duplicate a binary per language.

## LANGUAGE SWITCHER
- Every entry point starts with the switcher on line 1: the current language as plain text, the other language as a link.
- Root `README.md`:
  ```markdown
  English | [Português](docs/for_peoples/pt-BR/README.md)
  ```
- `docs/for_peoples/en/README.md`:
  ```markdown
  [README](../../../README.md) | English | [Português](../pt-BR/README.md)
  ```
- `docs/for_peoples/pt-BR/README.md`:
  ```markdown
  [README](../../../README.md) | Português | [English](../en/README.md)
  ```
- The switcher is reciprocal: from either side the reader reaches the other language and the project README in a single click.
- Do not add a third language, a third link, or flags and icons to the switcher without explicit instruction.

## TRANSLATION PARITY
- The two trees are mirrors: every file in `en/` has a file with the same relative path in `pt-BR/`, and vice versa. There is no exception and no orphan file.
- Documentation in only one language is not a partial delivery, it is an incomplete change. It must not be committed, pushed, or merged.
- Every change is written on both sides in the same commit. Translation is not a follow-up task, a debt, or a later commit.
- English is the source of truth for structure and meaning; `pt-BR` is the source of truth for Portuguese terminology.
- A translation is not word-for-word, but it must carry the same instructions, warnings, and limits. Never soften a warning and never drop a limitation.
- If a correct translation is beyond reach in the current change, the AI stops and asks the user. It never writes one side as a temporary state.
- Deleting a document means deleting both sides in the same commit.

## WHAT BELONGS IN FOR_PEOPLES
Everything a person needs in order to use, install, operate, or contribute to the project: overview, requirements, installation, configuration, usage, scripts, troubleshooting, FAQ, contributing, license.
## WHAT DOES NOT BELONG
- Decisions and their rationale — those go to `docs/spec/`.
- AI agent instructions — those go to `.ai-instructions/`.
- Internal architecture deep dives, unless a user needs them to operate the project.
- Hand-written API references — generate them instead of maintaining two hand-edited copies.

## WRITING RULES
- Every file starts with a single H1 title, and the heading order is identical in both languages, so navigation and anchors line up.
- Code blocks, command names, paths, environment variables, identifiers, and program output are never translated. Only the comments inside them may be.
- Document the command that actually exists in the project, never an aspirational one. When the script changes, the documentation changes in the same commit.
- Do not duplicate content between the root README and `docs/for_peoples` beyond the summary the language switch requires. A duplicated paragraph is a paragraph that will eventually contradict itself.
- Screenshots and diagrams are added only when they carry information that text cannot, and both languages reference the same file.
- Tables of commands stay short and aligned with `package.json`, `Makefile`, or the project's task runner — never invented.

## AGENT RULES
- Before writing public documentation, read the root README and the existing `docs/for_peoples` tree, and follow the structure that is already there.
- Every documentation change is written in both languages in the same commit. A document on only one side must not be committed.
- Before finishing, verify that each file has its counterpart in the other language and that no page exists on a single side.
- When the root README changes materially, update `docs/for_peoples/pt-BR/README.md` in the same commit.
- Never translate identifiers, and never invent product names, features, or limits while translating.
- Never rename a language folder or move a file between languages to fix a broken link. Fix the link.
- Documentation changes are `docs:` commits (see INSTRUCTIONS_FOR_COMMITS_AND_BRANCHES).
- If the repository has no `docs/for_peoples` yet, do not create empty scaffolding on an unrelated task. Create the structure when the task actually produces documentation.

## DEFINITION OF DONE (DOCUMENTATION)
A documentation change is done only when:
- [ ] The root README is in English and starts with the language switcher.
- [ ] `docs/for_peoples/en/` and `docs/for_peoples/pt-BR/` both exist, each with a `README.md`.
- [ ] Every file has a counterpart with the same relative path in the other language.
- [ ] Headings, commands, and code blocks are equivalent on both sides.
- [ ] Every relative link resolves from the file that contains it.
- [ ] The `pt-BR/README.md` contains the translated content of the root README.
- [ ] No localized README at the root, and no language in file names.
- [ ] Shared assets are stored once and referenced by both languages.

## WHAT NOT TO DO
- Do not write documentation in only one language, for any reason.
- Do not leave a translation for a later commit, a follow-up task, or an issue.
- Do not create `README.pt-BR.md` at the root.
- Do not put the language in a file name inside `docs/for_peoples`.
- Do not translate commands, paths, identifiers, or code.
- Do not link a repository file by absolute `github.com` URL.
- Do not duplicate the manual in the root README.
- Do not add a third language or a degenerate switcher layout.
- Do not leave a broken link behind after moving or renaming a document.
- Do not document commands that the project does not have.
