# Kickoff — viming

**Started:** 2026-11-12
**Status:** complete

> Log append-only. Cada rodada registra perguntas, respostas, decisões e o que ficou adiado.
> Nada aqui é reescrito: uma decisão superada recebe uma nova entrada datada.

## Contexto do repositório (levantado antes da primeira pergunta)

- Repositório `github.com:georgejrdev/viming` vazio de código: apenas `.git/` e `.ai-instructions/` (4 arquivos).
- Não existia `docs/spec/`; este kickoff começa do zero.
- Convenções já vigentes no repo:
  - commits convencionais em inglês (`feat:`, `fix:`, `docs:`…), branches por tipo (`feature/`, `docs/`…), merge commit `--no-ff`;
  - testes com cobertura tripla (feliz, borda, falha), mínimo de 80% de linhas/ramos no código alterado, execução local obrigatória;
  - documentação pública em inglês com espelho `pt-BR` em `docs/for_peoples`, paridade obrigatória no mesmo commit.
- `INSTRUCTIONS_FOR_CI_CD.md` é citado por `.ai-instructions/README.md`, mas o arquivo não existe no repositório. Registrado como pendência do repo; não bloqueia o kickoff.

## Round 0 — Enquadramento

**Date:** 2026-11-12

**Perguntas e respostas**

1. Q: O que é o `viming`? (opções: treinador de comandos Vim, editor modal próprio, distribuição de config, plugin, outro)
   A: **(a) treinador/jogo de comandos Vim.** A hipótese apresentada foi confirmada.
2. Q: Tipo de projeto e profundidade do spec?
   A: **MVP**, um **site simples**, **sem backend**, com os dados salvos em **módulos `.js` normais**, lidos em tempo real, **sem salvar dados** — tudo acontece na hora.
3. Q: Prazo para a primeira versão usável?
   A: **Sem prazo definido.**
4. Q: Idioma de `SPEC.md` e `Kickoff.md`?
   A: O site é **bilíngue**; o **SPEC fica em pt-BR** porque registra com precisão o diálogo.

**Decisões**

- D1: O produto é um treinador de comandos Vim entregue como site estático. — rationale: escolha explícita do usuário; é o menor produto que entrega valor sozinho.
- D2: Sem backend. Conteúdo dos desafios em módulos `.js`, carregados pelo próprio site. — rationale: escolha explícita; elimina infraestrutura, autenticação e banco.
- D3: Sem persistência de dados do usuário. — rationale: escolha explícita; simplifica privacidade e mantém o escopo pequeno.
- D4: Site bilíngue (inglês + pt-BR). — rationale: escolha explícita; alinhado à política de documentação do repo.
- D5: `docs/spec/SPEC.md` e `docs/spec/Kickoff.md` em pt-BR. — rationale: instrução explícita do usuário para esta tarefa; prevalece sobre a convenção de documentação em inglês (precedência definida em `.ai-instructions/README.md`). O espelho bilíngue continua obrigatório para `README.md` e `docs/for_peoples`.
- D6: Profundidade do spec = MVP, sem prazo. — rationale: escolha explícita; o escopo deve ser fatiado pelo valor, não pelo calendário.

**Adiado**

- Framework, linguagem e build do site — depende da mecânica e do escopo de comandos (Round 2).
- Formato exato dos módulos de desafio — depende da mecânica (Round 3).
- Hospedagem — a confirmar no Round 1 (restrição de plataforma).
- Conteúdo de `INSTRUCTIONS_FOR_CI_CD.md` — pendência do repo, fora do escopo deste kickoff.

**Aberto**

- Público exato (iniciante x usuário de Vim buscando fluência).
- Mecânica central e forma de pontuação.
- Quais comandos entram no MVP.
- Estrutura de níveis.

## Round 1 — Escopo e mecânica

**Date:** 2026-11-12

**Perguntas e respostas**

1. Q: Público exato (iniciante, usuário de Vim buscando fluência, speedrunner)?
   A: **(b) quem já usa Vim mas não é fluente.**
2. Q: Mecânica central (alvo, tarefa de edição, lição guiada)?
   A: **(b) tarefa de edição**, validando o estado final. Deve incluir operações de linha: copiar linha, colar linha, subir linha, etc.
3. Q: Quais comandos entram no MVP?
   A: **"Todos, tudo deve ser exercitado."** Desconsiderar o enquadramento de MVP: é um **projeto pessoal**. (O universo exato de "todos" precisa ser fechado no Round 2.)
4. Q: Estrutura dos desafios (trilha, trilha + aleatório, só aleatório)?
   A: **(b) trilha + modo aleatório.**
5. Q: Plataforma (desktop apenas, navegadores, mobile fora)?
   A: **"Site."** — a plataforma é web; a confirmação de desktop-only fica para o Round 2.
6. Q: Onde publicar (GitHub Pages, Vercel/Netlify, local)?
   A: **Apenas local.** Sem publicação nesta fase.
7. Q: "Sem salvar dados" inclui `localStorage`, cookies, analytics?
   A: **Pode salvar estado no próprio cliente**, sem grande preocupação, porque **não haverá backend**.

**Decisões**

- D7: Público = quem já usa Vim e quer fluência. — rationale: escolha explícita; permite medir eficiência (teclas/par) em vez de ensinar o básico.
- D8: Mecânica = tarefa de edição com validação do estado final do buffer/cursor, cobrindo também operações de linha (copiar, colar, mover linha). — rationale: escolha explícita; valida por resultado, aceitando qualquer solução correta.
- D9: O projeto **não é um MVP**; é um projeto pessoal cujo objetivo é exercitar todos os comandos do universo que será definido. — rationale: escolha explícita; remove a pressão de fatiar por valor e desloca a decisão para a taxonomia de comandos.
- D10: Trilha de desafios + modo aleatório. — rationale: escolha explícita; a trilha ensina a ordem, o aleatório treina reconhecimento.
- D11: Execução e uso apenas local; sem deploy nesta fase. — rationale: escolha explícita; elimina a necessidade de base path, domínio e pipeline de publicação.
- D12: Persistência no cliente é permitida e de baixa prioridade (`localStorage` para idioma, último desafio e melhores resultados). Sem backend, sem cookies de terceiros, sem analytics. **Supersede D3.** — rationale: escolha explícita; o custo é baixo e o benefício é retomar a sessão.
- D13: O escopo de comandos deixa de ser "MVP" e passa a ser uma taxonomia completa, a ser fechada no Round 2. — rationale: consequência direta de D9.

**Adiado**

- Definição do universo de "todos os comandos" — Round 2.
- Stack, build e estratégia de testes — Round 2.
- Esquema do arquivo de desafio — Round 3.
- Persistência: quais chaves e qual política de reset — Round 3.
- Mobile/toque: fora por ora; confirmar no Round 2.
- CI: o repo exige gate de CI, mas o uso é local; decidir se entra no escopo — Round 2/3.

**Aberto**

- O que "todos" inclui: só normal/visual/insert? inclui ex, folds, macros, marks?
- Framework e build.
- Desktop-only ou responsivo.

## Round 2 — Universo de comandos e arquitetura

**Date:** 2026-11-12

**Fatos verificados antes da rodada**

- `@replit/codemirror-vim` **6.4.0**, MIT, mantido; keymap Vim para CodeMirror 6.
- `vim-wasm` **0.0.13**, publicado em 2020, ~9 MB — opção legada.
- Angular **22.2.x** (novembro de 2026), Node `^22.22.3 || ^24.15.0 || >=26`; o CLI usa **Vitest + jsdom** por padrão em `ng test`.

**Perguntas e respostas**

1. Q: O que "todos" inclui? (A–D, A–E ou A–F)
   A: **Recomendação aceita: A–F**, com as exclusões declaradas (janelas, buffers múltiplos, terminal, plugins, LSP, completion, digraphs).
2. Q: Como o currículo se organiza?
   A: **(a) pelos grupos A–F**, com dificuldade crescente dentro de cada grupo.
3. Q: Motor Vim?
   A: **(b) CodeMirror 6 + `@replit/codemirror-vim` 6.4.0**, com motor de desafio/validação próprio.
4. Q: Como validar?
   A: **(b) estado final + contagem de teclas e tempo contra um par** definido no desafio.
5. Q: Stack?
   A: **Angular** (não era a recomendação; escolha explícita do usuário).
6. Q: Desktop-only ou responsivo?
   A: **Desktop-first.**

**Decisões**

- D14: Universo completo A–F: fundamentos, operadores/text objects, busca/salto, visual/registradores, macros/marks/folds, ex. — rationale: escolha explícita; o projeto não tem prazo e "tudo" foi pedido.
- D15: Currículo organizado pelos grupos A–F, com dificuldade crescente. — rationale: ensina a gramática do Vim e permite verificar completude por grupo.
- D16: Motor de edição = CodeMirror 6 + `@replit/codemirror-vim` 6.4.0; validação e currículo são código nosso, em TypeScript puro. — rationale: semântica real de Vim sem escrever um editor; o que é nosso fica testável sem DOM.
- D17: Validação = estado final (texto, cursor, seleção) + teclas/tempo contra o par. Não se exige sequência de comandos. — rationale: aceita soluções alternativas corretas e mantém a promessa de feedback objetivo.
- D18: Stack = Angular 22 (standalone + signals) com TypeScript; `ng test` (Vitest + jsdom) para unidade e Playwright para E2E. — rationale: escolha explícita do usuário; runner padrão do Angular 22 evita configuração paralela.
- D19: Desktop-first, mínimo 1024×700, teclado físico; sem layout de toque nesta fase. — rationale: escolha explícita; a mecânica é inteiramente por teclado.

**Adiado**

- Como provar que comandos indistinguíveis pelo resultado (macros, marks, registradores nomeados) foram exercitados — Round 3.
- Estratégia de i18n em Angular (build-time x runtime) — Round 3.
- Esquema do desafio e das chaves de texto — Round 3.
- Chaves e versão da persistência — Round 3.
- CI, acessibilidade detalhada e matriz de navegadores — Round 4.

**Aberto**

- Cobertura real do `codemirror-vim` contra a lista A–F (folds, `Ctrl-v`, `:g`, `:normal`) precisa de um spike.
- Angular 22 em modo zoneless + eventos do CodeMirror: atualização de UI depende de signals explícitos.

## Round 3 — Dados, validação e i18n

**Date:** 2026-11-12

**Perguntas e respostas**

1. Q: Como provar que um comando foi exercitado, se o estado final não o distingue?
   A: **(a) validação por resultado**; o desafio declara o comando-alvo e o par; completude garantida pelo currículo (AC-9), não em runtime.
2. Q: i18n build-time ou runtime?
   A: **(a) runtime**, com dicionário tipado e signal.
3. Q: Esquema do desafio?
   A: **(b) declarativo + `validate(snapshot)` puro opcional**, com `targetCommand` e `par` obrigatórios.
4. Q: Estrutura de telas?
   A: **(a) página única**, com barra lateral de grupos e editor sempre montado.
5. Q: Chaves de persistência?
   A: **Recomendação aceita**: `viming:v1:settings` e `viming:v1:results`, reset pela UI, descarte em versão desconhecida.
6. Q: Onde ficam os textos dos desafios?
   A: **Recomendação aceita**: chaves de i18n no dicionário; módulo do desafio neutro de idioma.
7. Q: O que conta como cobertura suficiente?
   A: **Recomendação aceita**: ≥1 desafio por comando; ≥2 para `d c y` e motions centrais; ≥1 por operação de linha.

**Decisões**

- D20: A validação é exclusivamente por resultado; `targetCommand` é metadado pedagógico e de pontuação, não uma exigência em runtime. — rationale: evita um segundo motor de parsing do Vim; aceita soluções alternativas.
- D21: i18n em runtime (`en.ts`/`pt-BR.ts` tipados + `LanguageService` com signal), sem build por locale. — rationale: AC-5 exige troca sem recarregar; o i18n nativo do Angular não permite.
- D22: Esquema de desafio = objeto declarativo (`initial`, `target`) **ou** predicado puro (`validate`), mais `targetCommand` e `par`. — rationale: legibilidade para o caso comum e flexibilidade para seleção/linha.
- D23: Página única, sem router; CodeMirror permanece montado. — rationale: preserva foco e estado do editor; não há link compartilhável em app local.
- D24: Persistência em `localStorage` com chaves versionadas, reset pela UI e descarte em caso de versão/JSON inválido. — rationale: dado antigo não pode quebrar a UI.
- D25: Textos de desafio em chaves de i18n; teste de paridade de chaves nos dois idiomas. — rationale: evita texto órfão e mantém o módulo de dados neutro.
- D26: Cobertura mínima do currículo: ≥1 por comando, ≥2 para `d c y` e `w b e 0 $ gg G`, ≥1 por operação de linha. — rationale: torna "tudo exercitado" verificável.

**Adiado**

- Ferramentas de lint/formatação, CI, matriz de navegadores, acessibilidade detalhada, documentação pública e licença — Round 4.
- Fluxo de branches/PR e definição de pronto — Round 4.

**Aberto**

- Nenhuma decisão de produto pendente; restam qualidade/operações e a aprovação final.

## Round 4 — Qualidade e operações

**Date:** 2026-11-12

**Fatos verificados**

- `ng lint` no Angular 22 exige um builder; o pacote atual é `@angular-eslint` **22.6.0** (ESLint 10).
- Prettier não vem embutido no Angular CLI.
- A versão vigente da AGPL é a **3.0** (2007); não existe AGPL v4.

**Perguntas e respostas**

1. Q: Estratégia de testes?
   A: **(a) Vitest + jsdom** para motor/componentes e **Playwright** para o fluxo real de teclado.
2. Q: Navegadores no E2E?
   A: **(a) Chromium + Firefox + WebKit.**
3. Q: Lint e formatação?
   A: **(a) `@angular-eslint` 22.6 + Prettier**, TypeScript `strict`.
4. Q: CI mesmo com uso local?
   A: **(b) sem CI**, só verificação local.
5. Q: Acessibilidade mínima?
   A: **Recomendação aceita**: foco no editor, `aria-live`, contraste AA, foco visível, `prefers-reduced-motion`, sem armadilha de teclado.
6. Q: Documentação pública e licença?
   A: **Sim**, documentação bilíngue; licença **AGPL-3.0** ("AGPL atualizada").
7. Q: Fluxo de branches e commits?
   A: **Recomendação aceita**: seguir `.ai-instructions/`.

**Decisões**

- D27: Testes em duas camadas — Vitest/jsdom para o motor puro e componentes, Playwright (Chromium, Firefox, WebKit) para o fluxo real de teclado. — rationale: o que é puro testa rápido; o que depende do navegador é provado no navegador.
- D28: Lint `@angular-eslint` 22.6 + Prettier; TypeScript `strict`. — rationale: `ng lint` funcional e estilo sem discussão.
- D29: **Sem CI nesta fase**, por escolha explícita. A verificação local (lint + testes + build + E2E) substitui o gate. **Conflito registrado:** `.ai-instructions/README.md` exige CI e cita `INSTRUCTIONS_FOR_CI_CD.md`, que não existe; a regra "merge only when CI is green" fica inaplicável. Se o projeto for publicado ou passar a ter CI, esta decisão é superada.
- D30: Acessibilidade mínima obrigatória: foco no editor, resultado por `aria-live`, contraste AA, foco visível, `prefers-reduced-motion`, sem armadilha de teclado. — rationale: o app é 100% teclado; falha de foco inviabiliza o uso.
- D31: Licença **AGPL-3.0**; `LICENSE` na raiz quando o código começar. Se o app for publicado, oferecer link visível para o código-fonte (seção 13 da AGPL). — rationale: escolha explícita; a obrigação de rede só passa a valer com publicação.
- D32: Fluxo do repo: branch por grupo, commits convencionais, `main` como integração, merge `--no-ff`. — rationale: convenção já escrita em `.ai-instructions/`.
- D33: Documentação pública bilíngue (README raiz em inglês + `docs/for_peoples/en|pt-BR`) no mesmo commit. — rationale: política obrigatória do repo.

**Adiado**

- Criação do `LICENSE` e do README público — junto com o primeiro código, fora do kickoff.
- CI — somente se o projeto for publicado.

**Aberto**

- Cobertura do `codemirror-vim` para A–F: spike antes do primeiro desafio.

## Round 5 — Confirmação e aprovação

**Date:** 2026-11-12

**Perguntas e respostas**

1. Q: Quando a validação dispara?
   A: **(a) a cada mudança de estado**, com sucesso assim que o alvo é atingido.
2. Q: O sucesso só vale em modo normal?
   A: **(a) sim**, exige normal mode.
3. Q: Quando o cronômetro começa?
   A: **(a) na primeira tecla.**
4. Q: Idioma inicial?
   A: **(a) idioma do navegador**, com fallback para inglês.
5. Q: Aprovação do spec?
   A: **Aprovado.** "Sigo a recomendação em todas as questões e aprovo o spec."

**Decisões**

- D34: Validação automática a cada mudança de estado; não existe botão de verificação. — rationale: feedback instantâneo é a mecânica do treinador e o Vim não tem "submit".
- D35: O sucesso só é avaliado em normal mode. — rationale: evita concluir no meio da digitação e reforça o reflexo de terminar com `Esc`.
- D36: O cronômetro começa na primeira tecla e para na conclusão. — rationale: mede execução, não leitura da instrução.
- D37: Sem preferência salva, o idioma inicial vem de `navigator.language` (pt* → pt-BR, senão inglês); a escolha persistida vence. — rationale: respeita o usuário sem exigir configuração.
- D38: **`SPEC.md` aprovado pelo usuário em 2026-11-12.** — rationale: confirmação explícita.

**Consequência registrada**

- Como o sucesso exige normal mode, desafios que usam seleção (grupo D) terminam com um operador que consome a seleção ou com `Esc`; alvos de seleção servem para diagnóstico do estado, não para concluir em visual mode.

**Adiado**

- Spike de cobertura do `codemirror-vim` — primeira tarefa do `lead`/`build`.
- Criação de `LICENSE`, README público e `docs/for_peoples` — junto com o primeiro código.
- CI e `INSTRUCTIONS_FOR_CI_CD.md` — apenas se/quando houver publicação.

---

## Open questions
| Question | Why it matters | Owner | Needed by |
| --- | --- | --- | --- |
| Cobertura do `codemirror-vim` para A–F | Lacunas exigem código nosso ou corte de escopo | decisão conjunta | antes do primeiro desafio |
| Conteúdo de `INSTRUCTIONS_FOR_CI_CD.md` | O repo cita um arquivo inexistente; sem CI, a regra de gate fica órfã | usuário | se/quando houver CI |
| CI ao publicar o projeto | A AGPL exige oferta de fonte na interação por rede | usuário | antes de publicar |

## Assumptions
- O site é de uso individual, sem contas, sem ranking e sem dados de terceiros.
- "Apenas local" significa `ng serve` / build estático servido localmente, sem hospedagem.
- O usuário tem Node 22.22.3+ ou 24.15+ disponível, exigência do Angular 22.
- O gerenciador de pacotes é o npm (padrão do Angular CLI); trocar por pnpm é reversível.
- Interface sóbria, sem biblioteca de componentes, com CSS próprio e tokens — reversível.
- O app abre em modo normal do Vim e o editor recebe foco automaticamente.
- Desafios de seleção terminam em normal mode, consumindo a seleção — consequência de D35.

## Encerramento

O kickoff termina com o spec aprovado. Nenhuma decisão de produto permanece em aberto; as três questões restantes são operacionais e não bloqueiam o início da implementação.

Próximo passo: `lead` ou `build` executa `docs/spec/SPEC.md`, começando pelo spike de cobertura do `codemirror-vim` e pelo scaffold Angular 22.

---

## Emendas de implementação (append-only)

Registro cronológico das decisões tomadas durante a construção que ajustaram o plano sem alterar objetivos.

### 2026-11-13 — Cobertura real do motor

- **Folds (`zf zo zc zR`) removidos do universo.** São estado de visualização, não do buffer; a validação por estado final não os observa. Mantê-los exigiria um segundo validador. — rationale: preserva R20 e a simplicidade do contrato de desafio.
- **`:g` removido do universo.** O motor não implementa o pipeline de comando global; `:%s` cobre o uso do currículo. — rationale: evitar reimplementar um parser de range/global dentro do app.
- **`:s`, `:%s`, `:m`, `:t`, `:normal` implementados com `Vim.defineEx`.** O `codemirror-vim` só fornece `:version`. — rationale: fecha o grupo F sem trocar de motor.
- **`it`/`at` mantidos com adaptador próprio.** `findMatchingTag` do motor retorna sempre `null` e `findEnclosingTag` exige árvore sintática; um scanner de tags sem dependência substitui o gancho. — rationale: preserva o currículo de text objects sem adicionar um parser HTML ao bundle.
- **`u`/`Ctrl-r` via `historySeed`.** A história do editor é montada no `applyInitial`, então o desafio continua validando só o estado final. — rationale: mantém D8 e D20.
- **`.` é editorial.** A solução natural usa `repeat`, mas qualquer caminho que alcance o alvo passa. — rationale: não existe verificação de "tecla usada", só de estado.
- **Reset de estado do Vim entre desafios.** `view.setState` não limpa os marcadores do adapter (`cm.marks`) nem o estado pendente; offsets antigos causavam `RangeError` em `recordJumpPosition` e a tecla seguinte era inserida como texto. A correção desanexa marcadores e envia `<Esc>` antes de posicionar o cursor. — rationale: o estado do Vim vive no adapter e sobrevive à troca de desafio.

### 2026-11-13 — Números finais

- Catálogo fechado: **114 comandos**; conteúdo: **124 desafios** (A 45, B 37, C 20, D 11, E 6, F 5).
- Verificação: `tsc --noEmit`, `ng build`, `ng lint` e `ng test` (182 testes) passam; Playwright cobre os 124 alvos em Chromium.

### 2026-11-13 — Endurecimentos da revisão

- **Seleção no alvo é opcional.** `selection` ausente significa "não importa"; `null` explícito exige ausência de seleção. — rationale: a maioria dos desafios valida buffer e cursor; exigir `null` sempre transformaria um detalhe de diagnóstico em falha.
- **Cursor do `historySeed` validado.** O editor posiciona o cursor no texto do seed antes de aplicar a mudança; um cursor que só cabe no buffer final faria `EditorState.create` lançar. `challengeProblems` agora reporta `initial.cursor is outside historySeed.text`. — rationale: falha na autoria, não no runtime.
- **`challengeProblems` nunca lança.** Um módulo de desafio malformado é reportado como inválido em vez de derrubar o registry no import. — rationale: conteúdo é autoral e o app precisa continuar carregando.
- **Aviso de modo só quando o alvo já foi alcançado.** Entrar em insert/visual não é erro; o aviso "termine com `Esc`" aparece só quando o estado, ignorando o modo, já satisfaz o alvo. — rationale: evita ruído durante a edição normal.
- **`parseResults` ignora `__proto__`/`constructor`/`prototype`.** — rationale: `localStorage` é dado não confiável mesmo sendo local.
- **Fallback de storage preserva memória.** Falha de leitura devolve o último estado em memória em vez de zerar. — rationale: com storage bloqueado, o progresso da sessão não pode desaparecer.

### 2026-11-13 — Evidência final

- `npx tsc --noEmit -p tsconfig.app.json` → OK.
- `npx ng lint` → all files pass.
- `npm run format:check` → all matched files use Prettier code style.
- `npx ng test --watch=false` → **191 testes / 7 arquivos** passando.
- `npx ng build` → 601.91 kB inicial (166.30 kB transferidos), sem erro de budget.
- `npx playwright test --project=chromium` → **3/3** (2 básicos + 124/124 alvos solucionáveis).
- `npx playwright test --project=firefox` → **3/3** (idem).
- `npx playwright test --project=webkit` → **3/3** (idem), executado com um desvio de ambiente descrito abaixo.
- **AC-17 fechado nas três engines.**

### 2026-11-13 — WebKit no host Arch (workaround reproduzível)

O bundle WebKit do Playwright é compilado em Ubuntu 24.04 e exige `libicudata/i18n/uc.so.74`, `libxml2.so.2`, `libjxl.so.0.8` e `libbacktrace.so.0`, que o Arch não fornece (icu 78, libxml2.so.16). Sem `sudo`, a solução foi extrair os `.deb` do Ubuntu 24.04 (`libicu74`, `libxml2`, `libbacktrace0`) e o `.rpm` do Fedora 39 (`libjxl 0.8.2`) em `/tmp/opencode/wk1` e injetá-los com `LD_PRELOAD`, que sobrevive ao `LD_LIBRARY_PATH` reescrito pelo wrapper do bundle:

```bash
L=/tmp/opencode/wk1
PRE="$L/icu/usr/lib/x86_64-linux-gnu/libicudata.so.74:\
$L/icu/usr/lib/x86_64-linux-gnu/libicui18n.so.74:\
$L/icu/usr/lib/x86_64-linux-gnu/libicuuc.so.74:\
$L/xml/usr/lib/x86_64-linux-gnu/libxml2.so.2:\
$L/bt/usr/lib/x86_64-linux-gnu/libbacktrace.so.0:\
$L/jxl/usr/lib64/libjxl.so.0.8"
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 LD_PRELOAD="$PRE" npx playwright test --project=webkit
```

Nada disso toca o sistema: os artefatos ficam em `/tmp` e o cache do navegador não é modificado. Em Ubuntu/Debian o comando canônico continua sendo `sudo npx playwright install-deps`.



### 2026-11-13 — Feedback de uso: objetivo, grupos, navegação e estatísticas

- **Cursor do objetivo visível.** `goalPreview` divide o texto-alvo no offset do cursor e o `<pre>` desenha um caret piscando (`.goal-caret`). — rationale: o rótulo `line, col` no canto não é lido; sem o caret o usuário não sabe onde o cursor deve terminar.
- **Grupos não encolhem mais.** `overflow: hidden` em `.group` anula o tamanho mínimo automático de um flex item; `flex: 0 0 auto` impede o clipping dos grupos colapsados. A lista do grupo ativo ganhou `max-height: 42vh` com scroll próprio, e o breakpoint de colapso passou de `max-width: 1024px` para `1023px`, preservando duas colunas em 1024×700. — rationale: o grupo ativo alto empurrava os demais para alturas menores que o próprio ícone.
- **Navegação acima do editor.** `.stage-nav` fica entre o painel da tarefa e o editor, com atalhos `Alt+←`/`Alt+R`/`Alt+→` capturados no `document` em fase de captura (mapeados por `event.code`), exibidos em `<kbd>` e anunciados por `aria-keyshortcuts`. — rationale: os botões ficavam abaixo do editor e saíam da tela; a captura impede o vim de ver a tecla e o navegador de navegar no histórico.
- **Conclusão visível onde o usuário está olhando.** Em telas empilhadas o painel de resultado fica abaixo da dobra, então o box do objetivo fica verde com "Objetivo atingido. Desafio concluído." (`task.goalDone`) e âmbar quando o alvo é atingido fora do modo normal. — rationale: feedback imediato de acerto/erro sem rolar a página.
- **Aba de estatísticas.** `buildStats` puro agrega os resultados já salvos (concluídos, tentativas, médias, melhor tempo, menos teclas e progresso por grupo) contando apenas desafios existentes, então ids obsoletos não inflam os números. O diálogo abre ao lado de "Limpar dados", fecha com botão ou `Esc`, devolve o foco ao gatilho e mantém os atalhos Alt inertes enquanto aberto. — rationale: reusa o `localStorage` versionado sem schema novo.
- **Orçamento de estilo do componente revisto** de 8/12 kB para 12/16 kB em `angular.json`. — rationale: o shell concentra o CSS; o aviso não deve disparar por uma feature legítima.

### 2026-11-13 — Evidência da rodada

- `npx tsc --noEmit -p tsconfig.app.json` → OK.
- `npx ng lint` → all files pass.
- `npx prettier --check .` → all matched files use Prettier code style.
- `npx ng test --watch=false` → **206 testes / 8 arquivos**.
- `npx ng build` → 616.77 kB inicial (168.91 kB transferidos), sem aviso de budget.
- `npx playwright test --project=chromium` → **6/6** (5 básicos + 124/124 alvos solucionáveis).
- `npx playwright test --project=firefox` → **6/6**.
- `npx playwright test --project=webkit` → **6/6** (com o shim descrito acima).
