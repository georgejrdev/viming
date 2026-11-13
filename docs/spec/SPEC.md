# viming — Especificação

**Status:** approved
**Last updated:** 2026-11-13

## 1. Problema

Aprender os comandos do Vim por leitura produz reconhecimento, não fluência. Quem já usa o Vim no dia a dia continua preso a um subconjunto pequeno de motions e operadores porque não tem um lugar seguro, curto e repetível para praticar. Tutoriais pedem instalação, configuração e um arquivo real para editar — atrito demais para cinco minutos de treino.

O `viming` oferece prática curta no navegador, sem instalação e sem conta: o usuário recebe uma tarefa, resolve com teclas do Vim e vê o resultado na hora.

## 2. Usuários e casos de uso

- **Persona principal:** desenvolvedor que já usa Vim, mas não é fluente — conhece `hjkl`, talvez `dd`, e quer incorporar o restante ao reflexo.
- **Situação:** uma pausa de 5 a 15 minutos, no desktop, sem instalar nem configurar nada.
- **O que precisa alcançar:** treinar um conceito por vez, receber feedback imediato, repetir até acertar e, depois, treinar em modo aleatório.

## 3. Objetivos

- Exercitar **todos** os comandos do universo definido nesta spec, um conceito por nível.
- Dar feedback imediato e objetivo sobre acerto, erro e eficiência (teclas contra um par, tempo).
- Funcionar como site estático, sem backend, com estado apenas no cliente.
- Ser utilizável em inglês e pt-BR, com o mesmo conteúdo.
- Servir como projeto pessoal de longo prazo, sem prazo de entrega.

## 4. Non-goals

- Não é um editor de texto utilizável no dia a dia; não abre arquivos do usuário.
- Não substitui o Vim nem implementa Vimscript, plugins, LSP ou `~/.vimrc`.
- Não tem contas, login, ranking global ou multiplayer.
- Não tem backend, banco de dados ou API própria.
- Não tem versão mobile ou por toque nesta fase.
- Não será publicado nesta fase: execução apenas local.

## 5. Escopo

### Fase atual

- Aplicação web estática em Angular, executada localmente, com trilha de desafios e modo aleatório.
- Desafios definidos em módulos `.js`, carregados pelo próprio site.
- Validação do estado final (buffer + cursor + seleção) para tarefas de edição, incluindo operações de linha.
- Interface e instruções bilíngues (inglês e pt-BR).
- Persistência local de baixa prioridade (idioma, último desafio, melhores resultados).

### Universo de comandos (fechado)

**A. Fundamentos** — `h j k l w W b B e E 0 ^ $ gg G ge gE`, contagens (`3w`, `5j`, `2dd`), `i I a A o O`, `x X r s S C D Y p P J`, `u`, `Ctrl-r`, `.`

**B. Operadores e text objects** — `d c y > < = g~ gu gU`; `iw aw iW aW i" a" i' a' i( a( i[ a[ i{ a{ ip ap it at`; `dd yy cc`; `ddp`, `yyp`; mover linha (`ddkP` / `ddjP`)

**C. Busca e salto** — `/ ? n N * # f F t T ; , % { } ( ) H M L`

**D. Visual e registradores** — `v V Ctrl-v`, `o`, operador sobre seleção; `"a`–`"z`, `"0`, `"_`, `"+`/`"*` (quando o navegador permitir); `p P` com registrador

**E. Macros e marks** — `q @ @@`; `m ' \``  (folds removidos — ver emenda de implementação)

**F. Ex** — `:s :%s :m :t :normal`  (`:g` removido — ver emenda de implementação)

**Fora do universo:** janelas, buffers múltiplos, terminal, plugins, LSP, completion e digraphs.

### Emenda de implementação (2026-11-13)

Registrada durante a construção, sem alterar os objetivos da spec:

- **Folds (`zf zo zc zR`) removidos.** São estado de visualização, não do buffer. A validação é por estado final (R20) e não consegue observar dobras; manter o comando exigiria um segundo mecanismo de validação. Motivou o corte.
- **`:g` removido.** O pipeline de comando global do Vim não está no motor; `:%s` cobre o caso de uso do currículo (substituição em todo o buffer).
- **`:s`, `:%s`, `:m`, `:t` e `:normal` implementados** sobre `Vim.defineEx`, porque o `codemirror-vim` só traz `:version`.
- **`it`/`at` mantidos.** O gancho de tag do `codemirror-vim` depende de uma árvore sintática; como o editor é agnóstico de linguagem, foi substituído por um scanner de tags próprio, sem dependência nova.
- **`u`/`Ctrl-r`** usam `historySeed` no estado inicial: a história do editor é montada para que o desafio continue validando apenas o estado final.
- **`.` é editorial**: a solução natural usa repetição, mas qualquer sequência que atinja o alvo é aceita.
- O catálogo fechado tem **114 comandos** e o conteúdo tem **124 desafios** (A 45, B 37, C 20, D 11, E 6, F 5).

### Later

- Publicação, CI dedicado, suporte mobile, novos idiomas e gamificação além de teclas/tempo.

## 6. Requisitos funcionais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| R1 | O site apresenta um desafio com texto inicial e objetivo explícito. | must |
| R2 | O usuário interage usando teclas do Vim; setas e mouse não movem o cursor na área de jogo. | must |
| R3 | O site valida o estado final e informa acerto ou erro imediatamente. | must |
| R4 | O site contabiliza teclas usadas, tempo e o par do desafio. | must |
| R5 | O usuário pode reiniciar o desafio atual sem recarregar a página. | must |
| R6 | O usuário pode escolher grupo/desafio e avançar ou voltar na trilha. | must |
| R7 | Existe um modo aleatório que sorteia desafios de todos os grupos. | must |
| R8 | A interface e as instruções existem em inglês e pt-BR, com troca em um clique. | must |
| R9 | Os desafios são definidos em módulos `.js`, sem banco de dados nem API. | must |
| R10 | Operações de linha são exercitadas: copiar, colar, mover para cima/baixo, apagar e duplicar. | must |
| R11 | Todos os comandos do universo A–F possuem ao menos um desafio que os exige. | must |
| R12 | Idioma, último desafio e melhores resultados são salvos no cliente; o app funciona com armazenamento bloqueado. | should |
| R13 | O usuário pode limpar os dados salvos localmente pela interface. | should |
| R14 | O currículo é organizado nos grupos A–F, com dificuldade crescente dentro de cada grupo. | must |
| R15 | Cada desafio declara o comando-alvo e o par de teclas usado na pontuação. | must |
| R16 | O resultado mostra teclas usadas, tempo e a comparação com o par. | must |
| R17 | Cada desafio declara `initial` e exatamente um entre `target` e `validate(snapshot)`. | must |
| R18 | Todo texto visível de desafio referencia uma chave de i18n existente nos dois idiomas. | must |
| R19 | A validação roda automaticamente a cada mudança de estado; não existe botão de verificação. | must |
| R20 | O desafio só é concluído em modo normal do Vim. | must |
| R21 | O cronômetro começa na primeira tecla e para na conclusão. | must |
| R22 | Sem preferência salva, o idioma inicial segue o navegador (pt* → pt-BR, senão inglês). | should |

## 7. Arquitetura e stack

| Camada | Escolha | Papel |
| --- | --- | --- |
| Framework | Angular 22 (standalone components + signals, zoneless) | Shell da aplicação, telas, i18n e persistência |
| Linguagem | TypeScript | Todo o código |
| Build/dev | Angular CLI (`ng serve`, `ng build`) | Servidor local e build estático |
| Editor | CodeMirror 6 + `@replit/codemirror-vim` 6.4.0 (MIT) | Buffer, cursor, seleção e keymap Vim |
| Motor de desafio | TypeScript puro, sem DOM | Registro de desafios, validação, pontuação |
| i18n | Dicionário runtime tipado + `LanguageService` com signal | Inglês e pt-BR sem recarregar |
| Testes | `ng test` (Vitest + jsdom) + Playwright (Chromium, Firefox, WebKit) | Unidade/integração e E2E |
| Lint/format | `@angular-eslint` 22.6 + Prettier | `ng lint` e estilo consistente |
| Persistência | `localStorage` versionado | Idioma, último desafio, melhores resultados |

**Princípios**

- O motor de desafio não importa Angular nem CodeMirror: recebe um snapshot (`lines`, `cursor`, `selection`, `mode`) e devolve `pass | fail`.
- CodeMirror é envolvido por um componente/diretiva; nenhuma regra de negócio vive nele.
- Eventos do CodeMirror atualizam signals explicitamente (zoneless), evitando depender de `zone.js`.
- O build é estático e local: `ng build` gera arquivos que podem ser servidos por qualquer servidor estático.

### 7.1 Esquema do desafio

```js
// src/app/challenges/group-a/a-01.js
export const challenge = {
  id: 'a-01-move-word',          // único, estável
  group: 'A',                     // A–F
  order: 10,                      // ordem dentro do grupo
  difficulty: 1,                  // 1–5
  titleKey: 'challenge.a01.title',
  taskKey: 'challenge.a01.task',
  hintKey: 'challenge.a01.hint',  // opcional
  initial: {
    text: '...',
    cursor: { line: 0, ch: 0 },
    selection: null,              // opcional
  },
  target: {                       // OU validate(snapshot)
    text: '...',
    cursor: { line: 0, ch: 4 },
    selection: null,
  },
  validate: (snapshot) => true,   // opcional, puro e determinístico
  targetCommand: 'w',             // comando do universo
  par: { keystrokes: 2, seconds: 8 },
};
```

- `snapshot` = `{ lines: string[], cursor: { line, ch }, selection: { anchor, head } | null, mode: string }`.
- Exatamente um entre `target` e `validate`; `validate` não pode ter efeitos colaterais.
- `targetCommand` precisa pertencer ao universo A–F; `par.keystrokes` e `par.seconds` são maiores que zero.
- Módulos de desafio são neutros de idioma: nenhum texto visível embutido.
- A validação roda a cada mudança de estado, mas o desafio só é concluído em normal mode. Desafios de seleção terminam com um operador que consome a seleção ou com `Esc`; `selection` no alvo serve para diagnóstico, não para concluir em visual mode.

### 7.2 i18n

- `src/app/i18n/en.ts` e `src/app/i18n/pt-BR.ts` implementam o mesmo tipo `Dictionary`.
- `LanguageService` expõe um signal de idioma e `t(key)`; a escolha é persistida em `settings`.
- Sem preferência salva, o idioma inicial vem de `navigator.language`: locale `pt*` abre em pt-BR, qualquer outro abre em inglês.
- Teste de paridade falha se uma chave existir em um idioma e faltar no outro.
- Nenhum uso de i18n build-time do Angular, porque ele exige um build por locale e recarga.

### 7.3 Persistência

- `viming:v1:settings` → `{ lang: 'en' | 'pt-BR', lastChallengeId: string | null }`
- `viming:v1:results` → `{ [challengeId]: { bestKeystrokes, bestSeconds, attempts } }`
- Reset pela interface remove as duas chaves.
- JSON inválido, versão desconhecida ou `localStorage` bloqueado → operar em memória, sem quebrar a sessão.

### 7.4 Telas

Página única, sem router:

- cabeçalho: título, alternador de idioma, reset de dados;
- barra lateral: grupos A–F com progresso e botão de modo aleatório;
- área principal: painel da tarefa (título, instrução, dica), editor CodeMirror e painel de resultado (teclas, tempo, par);
- o editor mantém o foco ao trocar de desafio, idioma ou grupo.


## 8. Requisitos não funcionais

- **Plataforma:** navegador desktop atual (Chrome, Firefox, Safari, Edge); teclado físico; desktop-first, mínimo 1024×700.
- **Navegadores testados:** Chromium, Firefox e WebKit no Playwright; Edge é coberto pelo motor do Chromium.
- **Rede:** após o carregamento inicial, o uso não depende de rede.
- **Privacidade:** nenhum dado sai do navegador; sem backend, sem analytics, sem cookies de terceiros.
- **Desempenho:** troca de desafio e validação percebidas como instantâneas (< 100 ms).
- **Acessibilidade:** foco visível, contraste AA, feedback por `aria-live`, respeito a `prefers-reduced-motion` e navegação por teclado sem armadilhas.
- **Qualidade:** TypeScript `strict`, `ng lint` sem erros, cobertura tripla (feliz, borda, falha) e mínimo de 80% de linhas/ramos no código alterado, conforme `.ai-instructions/INSTRUCTIONS_FOR_WRITTEN_TESTS.md`.
- **Verificação:** sem CI nesta fase; lint, testes, build e E2E são executados localmente antes de qualquer merge.

## 9. Critérios de aceitação

- [ ] AC-1: `ng build` produz um site estático que roda sem backend; com a rede desligada após o carregamento, a sessão de treino continua funcionando.
- [ ] AC-2: nenhuma requisição de rede envia dados do usuário em nenhum fluxo; o armazenamento é exclusivamente local.
- [ ] AC-3: o app funciona quando `localStorage` está bloqueado ou indisponível, sem quebrar a sessão.
- [ ] AC-4: limpar os dados locais pela interface remove idioma, último desafio e melhores resultados, e a UI volta ao estado inicial.
- [ ] AC-5: toda a interface e todas as instruções de desafio aparecem em inglês e em pt-BR, e o alternador troca o idioma sem perder o desafio atual.
- [ ] AC-6: os desafios são carregados de módulos `.js` do projeto; não existe `fetch` de JSON de desafios nem endpoint de conteúdo.
- [ ] AC-7: setas, Page Up/Down e clique do mouse não movem o cursor na área de jogo.
- [ ] AC-8: cada desafio tem teste de caminho feliz, de borda e de falha, com o validador coberto por testes determinísticos.
- [ ] AC-9: existe ao menos um desafio para cada comando do universo A–F, verificado por um teste que compara a lista de comandos com o conjunto de desafios.
- [ ] AC-10: o modo aleatório sorteia apenas desafios válidos e nunca repete o mesmo desafio em sequência imediata.
- [ ] AC-11: ao concluir um desafio, a tela mostra teclas usadas, tempo e a diferença para o par.
- [ ] AC-12: a interface continua funcional com o foco no editor após trocar de desafio, idioma ou grupo.
- [ ] AC-13: um teste de integridade rejeita desafio sem `initial`, com `target` e `validate` simultâneos, com `targetCommand` fora do universo ou com `par` inválido.
- [ ] AC-14: um teste de paridade falha se qualquer chave usada por desafio ou interface existir em apenas um dos idiomas.
- [ ] AC-15: com `localStorage` contendo JSON inválido ou versão desconhecida, o app inicia limpo e não lança erro.
- [ ] AC-16: `ng lint` e `npx tsc --noEmit` passam sem erros no código entregue.
- [ ] AC-17: o fluxo crítico (carregar → escolher desafio → acertar com teclas → ver resultado) passa no Playwright em Chromium, Firefox e WebKit.
- [ ] AC-18: ao carregar e ao trocar de desafio, o foco está no editor; o resultado é anunciado por `aria-live` e o foco é sempre visível.
- [ ] AC-19: nenhuma tela depende de movimento; com `prefers-reduced-motion`, não há animação não essencial.
- [ ] AC-20: ao atingir o alvo, o resultado aparece sem clique, botão ou tecla de confirmação.
- [ ] AC-21: um alvo atingido durante insert, replace ou visual mode não conclui o desafio; a conclusão só ocorre em normal mode.
- [ ] AC-22: o cronômetro não avança antes da primeira tecla e para no instante da conclusão.
- [ ] AC-23: sem preferência salva, um navegador com locale `pt-BR` abre em pt-BR e qualquer outro abre em inglês; uma preferência salva vence o padrão.

## 10. Restrições

- Site estático, sem backend, sem banco e sem autenticação.
- Dados dos desafios em módulos `.js` comuns, lidos em tempo real.
- Execução apenas local nesta fase; sem deploy.
- Sem CI nesta fase: a verificação é local (lint, testes, build, E2E). Isso diverge da convenção de CI do repo, que fica suspensa por decisão do usuário.
- Angular 22 exige Node `^22.22.3 || ^24.15.0 || >=26`.
- Gerenciador de pacotes: npm.
- Licença: AGPL-3.0. Se o app for publicado, a seção 13 exige oferecer o código-fonte aos usuários da rede.
- Duas línguas: inglês e pt-BR.
- Sem prazo definido; o escopo é fatiado por grupo de comandos.
- O repositório exige commits convencionais, branches por tipo e testes com cobertura tripla.

## 11. Decisões

| # | Decisão | Rationale |
| --- | --- | --- |
| D1 | Treinador de comandos Vim entregue como site estático | Menor produto que entrega valor sozinho; escolha do usuário |
| D2 | Sem backend; conteúdo em módulos `.js` | Elimina infraestrutura, banco e autenticação |
| D4 | Site bilíngue (inglês e pt-BR) | Alcança os dois públicos e segue a política do repo |
| D7 | Público: quem já usa Vim e quer fluência | Permite medir eficiência em vez de ensinar o básico |
| D8 | Mecânica: tarefa de edição validada pelo estado final | Aceita qualquer solução correta; validador puro e testável |
| D9 | Projeto pessoal, sem enquadramento de MVP; todos os comandos do universo são exercitados | Escolha explícita do usuário |
| D10 | Trilha + modo aleatório | Trilha ensina a ordem; aleatório treina reconhecimento |
| D11 | Execução apenas local, sem deploy | Escolha explícita; reduz infraestrutura |
| D12 | Persistência no cliente permitida (idioma, último desafio, melhores resultados) | Custo baixo, retoma a sessão; supersede a decisão anterior de não persistir |
| D14 | Universo A–F fechado, com exclusões declaradas | "Tudo" delimitado ao que faz sentido em um buffer no navegador |
| D15 | Currículo pelos grupos A–F | Ensina a gramática do Vim e permite teste de completude |
| D16 | CodeMirror 6 + `@replit/codemirror-vim` 6.4.0 como motor de edição | Semântica real de Vim sem escrever um editor; nosso código fica testável |
| D17 | Validação por estado final + teclas/tempo contra o par | Aceita soluções alternativas e mede eficiência |
| D18 | Angular 22 (standalone + signals) + Vitest/jsdom + Playwright | Escolha do usuário; runner padrão do Angular 22 |
| D19 | Desktop-first, mínimo 1024×700, teclado físico | A mecânica é inteiramente por teclado |
| D20 | Validação só por resultado; `targetCommand` é metadado | Evita um segundo motor de parsing e aceita soluções alternativas |
| D21 | i18n runtime com dicionário tipado, sem build por locale | AC-5 exige troca sem recarregar |
| D22 | Desafio declarativo com `validate(snapshot)` puro opcional | Legível no caso comum, flexível para seleção e linha |
| D23 | Página única, sem router; editor sempre montado | Preserva foco e estado; não há link compartilhável |
| D24 | Persistência versionada com reset e descarte seguro | Dado antigo não pode quebrar a UI |
| D25 | Textos de desafio em chaves de i18n | Evita texto órfão e mantém o dado neutro |
| D26 | Cobertura: ≥1 por comando, ≥2 para `d c y` e motions centrais, ≥1 por operação de linha | Torna "tudo exercitado" verificável |
| D27 | Vitest/jsdom para motor e componentes; Playwright (Chromium, Firefox, WebKit) para o fluxo real | O que é puro testa rápido; o que depende do navegador é provado nele |
| D28 | `@angular-eslint` 22.6 + Prettier; TypeScript `strict` | `ng lint` funcional e estilo consistente |
| D29 | Sem CI nesta fase; verificação local substitui o gate | Escolha explícita; conflito com a convenção de CI do repo registrado |
| D30 | Acessibilidade mínima obrigatória | O app é 100% teclado; falha de foco inviabiliza o uso |
| D31 | Licença AGPL-3.0; link de fonte se houver publicação | Escolha explícita; dever de rede só surge com publicação |
| D32 | Fluxo de branches e commits do repo | Convenção já escrita em `.ai-instructions/` |
| D33 | Documentação pública bilíngue no mesmo commit | Política obrigatória do repo |
| D34 | Validação automática a cada mudança de estado, sem botão de verificação | Feedback instantâneo é a mecânica do treinador |
| D35 | Sucesso só em normal mode | Evita concluir no meio da digitação; reforça `Esc` |
| D36 | Cronômetro começa na primeira tecla | Mede execução, não leitura |
| D37 | Idioma inicial do navegador, fallback inglês; preferência salva vence | Respeita o usuário sem configuração |
| D38 | Spec aprovado pelo usuário em 2026-11-12 | Confirmação explícita |
| D5 | `SPEC.md` e `Kickoff.md` em pt-BR | Instrução explícita do usuário; o espelho bilíngue vale para a documentação pública |
| D6 | Profundidade de 3–5 rodadas, sem prazo | Fecha os one-way doors sem inventar urgência |

## 12. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| `codemirror-vim` não cobrir todo o universo A–F (folds, `Ctrl-v`, `:g`, `:normal`) | Comandos do currículo não funcionam | Spike inicial mapeando comando a comando; implementar lacunas ou cortar com decisão registrada |
| "Todos os comandos" virar alvo móvel | O projeto nunca é considerado completo | Universo congelado nesta spec; completude verificada por AC-9 |
| Comandos indistinguíveis pelo estado final (macros, marks, registradores) | "Exercitado" fica editorial | Desafio declara `targetCommand` e par; completude garantida por AC-9; sem enforcement em runtime |
| Angular 22 zoneless + eventos do CodeMirror | UI não atualiza após uma tecla | Atualizar signals explicitamente no callback do editor |
| Conflito de atalhos do navegador (Ctrl/Cmd) | Macros, undo e registradores falham | `preventDefault` seletivo e testes nas três engines |
| Duas línguas divergirem | Texto inconsistente entre en e pt-BR | Dicionário único tipado e teste de paridade (AC-14) |
| Persistência quebrar após mudança de esquema | UI travada com dados antigos | Chaves versionadas e descarte seguro (AC-15) |
| Sem CI e verificação apenas local | Regressão chega em `main` se o checklist não for seguido | Checklist local obrigatório (lint, testes, build, E2E) e histórico limpo por branch |
| Publicar sem cumprir a AGPL | Obrigação de oferecer o código-fonte descumprida | Se houver publicação, adicionar link "Source" visível antes do deploy |
| ~60–70 desafios com qualidade desigual | Currículo inflado e pouco útil | Revisão por grupo; cada desafio precisa de teste e de justificativa do par |
| Escopo grande desmotivar | Projeto abandonado | Fatiar por grupo de comandos, cada grupo entregando algo jogável |

## 13. Questões abertas

- [ ] Cobertura do `codemirror-vim` contra o universo A–F — decisão conjunta — spike antes do primeiro desafio
- [ ] O arquivo `INSTRUCTIONS_FOR_CI_CD.md` citado pelo repo será criado? — usuário — se/quando houver CI
- [ ] CI será adicionado se o projeto for publicado? — usuário — antes de publicar

## 14. Change log

| Data | Mudança | Motivo |
| --- | --- | --- |
| 2026-11-12 | Criação do spec em rascunho após a Rodada 0 | Enquadramento inicial: site estático, sem backend, bilíngue |
| 2026-11-12 | Rodada 1: público, mecânica de tarefa, escopo completo, trilha + aleatório, execução local, persistência no cliente | Respostas do usuário; supersede as decisões iniciais de não persistir e de escopo MVP |
| 2026-11-12 | Rodada 2: universo A–F, currículo por grupos, CodeMirror + codemirror-vim, validação por estado + par, Angular 22, desktop-first | Respostas do usuário; stack e motor fechados |
| 2026-11-12 | Rodada 3: validação por resultado, i18n runtime, esquema de desafio, página única, chaves de persistência, cobertura mínima | Respostas do usuário; contrato de dados e i18n fechados |
| 2026-11-12 | Rodada 4: Vitest + Playwright, três engines, ESLint + Prettier, sem CI, acessibilidade, AGPL-3.0, fluxo do repo | Respostas do usuário; qualidade e licença fechadas |
| 2026-11-12 | Rodada 5: validação automática, sucesso em normal mode, cronômetro na primeira tecla, idioma do navegador; **spec aprovado** | Confirmação explícita do usuário |
