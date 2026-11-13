# Design da interface — viming

Documento vivo do design de interface do `viming`. Registra a visão geral, os
padrões visuais e as decisões de design acumuladas durante a construção —
especialmente as correções vindas de uso real.

- **Requisitos e critérios de aceite**: `docs/spec/SPEC.md`.
- **Log de decisões de engenharia**: `docs/spec/Kickoff.md`.
- **Notas para quem usa**: `docs/for_peoples/`.

Este arquivo cobre o **porquê visual e de interação**: o que a tela mostra, onde
mostra e por quê. Quando uma decisão de design também mudou a arquitetura, o
registro técnico completo está no `Kickoff.md`.

---

## 1. Princípios

1. **O estado final é a resposta.** O app valida o buffer, o cursor e a seleção,
   então a interface precisa mostrar exatamente o estado alvo — não apenas
   descrevê-lo. Texto, cursor e seleção são o contrato visível.
2. **Feedback onde o olho está.** O usuário olha para o objetivo e para o
   editor. O resultado não pode ser a única fonte de acerto/erro, porque em
   telas empilhadas ele fica abaixo da dobra.
3. **Teclado primeiro, sem sequestrar o Vim.** O editor tem foco; o Vim consome
   as teclas. Atalhos do app usam modificadores que o Vim não reivindica e são
   capturados antes dele.
4. **Uma página, um foco.** Sem router, sem navegação de página, sem modais
   empilhados. A tela é o treino.
5. **Silêncio quando não há nada a dizer.** Sem banners, sem onboarding, sem
   telemetria. A dica é opcional e o aviso de armazenamento só aparece quando o
   storage falha.
6. **Acessível por padrão.** Diálogo com `role="dialog"`, regiões vivas para o
   resultado, `aria-keyshortcuts` nos botões, foco visível e respeito a
   `prefers-reduced-motion`.

---

## 2. Visão geral da tela

Layout desktop-first, mínimo suportado **1024×700**. Acima de 1023px a tela tem
duas colunas; em 1023px ou menos a barra lateral empilha acima do palco.

```text
┌──────────────────────────────────────────────────────────────────┐
│ [V] viming                 tagline      [EN|PT-BR] [Estatísticas] │
│                                                [Limpar dados]    │
├───────────────┬──────────────────────────────────────────────────┤
│ [⤨ Aleatório] │ GRUPO A · DESAFIO        [Comando: h] [Par: ...]│
│ GRUPOS        │ Título do desafio                                │
│ ┌───────────┐ │ Instrução (+ dica opcional)                      │
│ │A  ... 1/45│ │ ┌ Objetivo ────────────────────────────────────┐ │
│ │ ✓ h       │ │ │ line 1, col 3                                │ │
│ │ · j       │ │ │ ab▌cdef                                      │ │
│ │ ...       │ │ │ ✓ Objetivo atingido. Desafio concluído.      │ │
│ └───────────┘ │ └──────────────────────────────────────────────┘ │
│ ┌───────────┐ │ [← Anterior Alt+←][Reiniciar Alt+R][Próximo Alt+→]│
│ │B  ... 0/37│ │ ┌ Editor ──────────────────────────────────────┐ │
│ └───────────┘ │ │ 1  abcdef                                     │ │
│ ┌───────────┐ │ └──────────────────────────────────────────────┘ │
│ │C  ... 0/20│ │ Ajuda do editor                                  │
│ └───────────┘ │ ┌ Resultado ───────────────────────────────────┐ │
│     ...       │ │ Teclas · Tempo · Par · Δ · Melhor · Tentativas│ │
│               │ └──────────────────────────────────────────────┘ │
└───────────────┴──────────────────────────────────────────────────┘
```

### 2.1 Topbar

- Marca (`V` em gradiente) e tagline.
- Troca de idioma em um clique (`EN` / `PT-BR`), com `aria-pressed`.
- **Estatísticas** abre o diálogo de progresso.
- **Limpar dados** apaga idioma, último desafio e resultados, com toast de
  confirmação por 3s.

### 2.2 Barra lateral

- Botão **Desafio aleatório** no topo.
- Seis grupos (A–F) com letra, nome, descrição e contador `concluídos/total`.
- O grupo ativo expande a lista de desafios; cada item mostra estado (`✓`/`·`),
  título e pontos de dificuldade.
- A lista do grupo ativo tem rolagem própria (`max-height: 42vh`), então os
  cabeçalhos dos outros grupos continuam alcançáveis.

### 2.3 Palco

Ordem fixa, de cima para baixo:

1. Painel da tarefa (título, badges de comando e par, instrução, dica).
2. **Box do objetivo** (estado final + mensagem de estado).
3. **Navegação do desafio** (anterior / reiniciar / próximo).
4. Editor.
5. Ajuda do editor.
6. Painel de resultado.

A navegação fica **entre o objetivo e o editor** de propósito: é o ponto que o
usuário alcança sem rolar, e os botões não competem com o painel de resultado.

### 2.4 Diálogo de estatísticas

Sobreposição modal (`role="dialog"`, `aria-modal="true"`) com largura máxima de
720px e altura máxima de 85vh. Conteúdo:

- Percentual geral + barra de progresso + `concluídos de total`.
- Cards: concluídos, tentativas, média de teclas, tempo médio.
- Destaques: resolução mais rápida e resolução com menos teclas (comando).
- Progresso por grupo com barra e percentual.
- Estado vazio quando ainda não há nenhum resultado.

---

## 3. Sistema visual

### 3.1 Cores

Tema escuro fixo (`color-scheme: dark`), definido em `src/styles.css`.

| Token             | Valor     | Uso                                   |
| ----------------- | --------- | ------------------------------------- |
| `--bg`            | `#070b14` | Fundo da página                       |
| `--surface`       | `#0d1424` | Painéis, sidebar, diálogo             |
| `--surface-2`     | `#111a2e` | Superfícies internas, box do objetivo |
| `--editor-bg`     | `#0f172a` | Editor                                |
| `--border`        | `#1e293b` | Bordas padrão                         |
| `--border-strong` | `#334155` | Bordas de destaque e tracejados       |
| `--text`          | `#e2e8f0` | Texto principal                       |
| `--muted`         | `#94a3b8` | Texto secundário                      |
| `--muted-2`       | `#475569` | Detalhes discretos                    |
| `--accent`        | `#38bdf8` | Ação, foco, links, barras             |

Cores semânticas:

- **Sucesso** `#4ade80` / `#bbf7d0` / `rgba(34, 197, 94, …)`.
- **Atenção** `#fcd34d` / `rgba(251, 191, 36, …)`.
- **Gradiente de marca e barras** `#38bdf8 → #22d3ee`.

O app não tem tema claro. O contraste é alto o suficiente para uso prolongado e
as cores semânticas nunca são o único canal: sempre há texto junto.

### 3.2 Tipografia

- Interface: `Inter`, `system-ui`, fallback sans-serif, base **15px**.
- Editor e prévia do objetivo: `JetBrains Mono`, `Fira Code`, monoespaçadas.
- Rótulos pequenos (eyebrow, badges, `kbd`): 0.68–0.78rem, com caixa alta e
  espaçamento quando são metadados.

### 3.3 Forma e espaçamento

- Raios: 0.4–0.65rem em controles, 0.75–1rem em painéis.
- Gap do layout: 1.25rem; padding externo: 1.25rem 1.5rem.
- Sidebar fixa (sticky) com `max-height: calc(100vh - 6.5rem)`.

---

## 4. Componentes e estados

### 4.1 Box do objetivo

É o componente central da experiência. Ele mostra o buffer alvo e o cursor
final, e agora carrega também o **estado da tentativa**.

Três estados:

| Estado    | Classe CSS   | Aparência                            | Mensagem                                   |
| --------- | ------------ | ------------------------------------ | ------------------------------------------ |
| Em curso  | —            | fundo `--surface-2`, borda tracejada | "Faça o buffer e o cursor ficarem iguais…" |
| Concluído | `.success`   | fundo e borda verdes, sólidos        | `✓ Objetivo atingido. Desafio concluído.`  |
| Atenção   | `.attention` | fundo e borda âmbar, sólidos         | "Objetivo atingido, mas termine com Esc…"  |

Regras:

- O estado verde só aparece com a conclusão real (buffer + cursor + seleção em
  normal mode). Não existe "quase certo" verde.
- O âmbar existe para o caso em que o estado já bate mas o modo ainda é
  insert/visual; ele não conclui o desafio.
- O texto muda junto com a cor; cor sozinha não comunica.
- A transição de cor é curta e desligada por `prefers-reduced-motion`.

**Cursor alvo.** O texto do objetivo é dividido no offset do cursor alvo e um
`<span class="goal-caret">` pisca entre as duas metades. A aritmética de offset
espelha a do editor (`line`/`ch`), então o caret aparece exatamente onde o
cursor deve terminar. O rótulo `line, col` continua no canto como dado
secundário, não como única pista.

O caret pisca em 1,1s com `steps(1, end)`. Com movimento reduzido, a regra
global remove a animação e o caret fica estático e visível.

### 4.2 Navegação do desafio

- Três botões iguais: anterior, reiniciar, próximo.
- Cada botão mostra o atalho em `<kbd>` (`Alt+←`, `Alt+R`, `Alt+→`) e expõe
  `aria-keyshortcuts`.
- Estados desabilitados no primeiro/último desafio da trilha.
- Reiniciar não desabilita nunca.

### 4.3 Painel de resultado

- Estatísticas ao vivo: teclas, tempo, par, delta de teclas, delta de tempo,
  melhor resultado e tentativas.
- `aria-live="polite"` anuncia a conclusão sem exigir foco.
- Verde quando concluído; os deltas ficam verdes quando iguais ou melhores que
  o par.
- Continua existindo como fonte detalhada, mas não é mais o único indicador.

### 4.4 Diálogo de estatísticas

- Aberto pelo botão no topbar, ao lado de "Limpar dados".
- Fecha pelo botão ✕ e por `Esc`; **não** fecha por clique no fundo (decisão de
  acessibilidade: um `div` clicável sem teclado viola as regras do ESLint).
- Ao abrir, o foco vai para o botão de fechar. Ao fechar, volta ao botão que
  abriu.
- Enquanto aberto, os atalhos `Alt+←`/`Alt+R`/`Alt+→` ficam inertes.
- Os números vêm só dos desafios que ainda existem; ids obsoletos no
  `localStorage` são ignorados.
- Percentual arredondado (`Math.round`), médias em uma casa decimal; sem
  resultados, mostra o estado vazio em vez de zeros enganosos.

### 4.5 Barra lateral de grupos

- Cada grupo é um cartão com letra, nome, descrição e contador.
- `flex: 0 0 auto` impede que o grupo ativo comprima os colapsados. Sem isso,
  `overflow: hidden` zera o tamanho mínimo automático do flex item e os grupos
  perdem ícone e texto.
- A lista do grupo ativo rola dentro de si; os outros cabeçalhos permanecem
  visíveis.
- O grupo ativo tem borda azul; o desafio atual tem fundo azul translúcido e o
  concluído tem `✓` verde.

---

## 5. Interação e acessibilidade

### 5.1 Teclado

- O editor recebe foco ao carregar e ao trocar de desafio.
- Setas, Page Up/Down, roda e mouse não movem o cursor no editor; clicar apenas
  devolve o foco.
- Atalhos do app: `Alt+←` anterior, `Alt+R` reiniciar, `Alt+→` próximo.
- Captura no `document`, em fase de captura, com `preventDefault` e
  `stopPropagation`, mapeada por `event.code` (funciona com layouts
  alternativos). O Vim não vê a tecla e o navegador não navega no histórico.
- `Esc` fecha o diálogo de estatísticas somente quando ele está aberto; fora
  disso, pertence ao Vim.
- Composição de IME (`isComposing`/`keyCode 229`) não conta tecla nem inicia o
  cronômetro.

### 5.2 Foco

- `:focus-visible` recebe contorno azul de 2px.
- O diálogo move o foco para dentro e o devolve ao gatilho ao fechar.
- Botões desabilitados não recebem foco.

### 5.3 Movimento

- A única animação contínua é o caret do objetivo.
- `prefers-reduced-motion: reduce` desliga animações e transições globalmente.

### 5.4 Idioma

- Inglês e pt-BR com o mesmo conjunto de chaves (teste de paridade).
- Padrão pelo navegador (`pt*` → pt-BR, resto → inglês); escolha salva vence.
- Trocar idioma não recarrega e não tira o foco do editor por muito tempo.

---

## 6. Responsividade

- **≥1024px**: duas colunas (sidebar 290px + palco), sidebar sticky.
- **≤1023px**: uma coluna; sidebar deixa de ser sticky e o palco vem depois.
- O palco mantém a ordem objetivo → navegação → editor → resultado em qualquer
  largura.
- O mínimo suportado é **1024×700**; abaixo disso o layout ainda funciona, mas
  não é o alvo de otimização.
- O breakpoint foi ajustado de 1024px para 1023px para que 1024×700 continue
  com duas colunas.

---

## 7. Registro de decisões de design

Decisões tomadas ou corrigidas durante a construção, em ordem cronológica.

| #   | Decisão                                                            | Motivo                                                                                                                    |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | Prévia textual exata do estado alvo (buffer + cursor + seleção)    | A validação é por estado final; descrever a tarefa em prosa não basta para saber onde o cursor deve parar.                |
| 2   | **Caret piscando dentro do objetivo**                              | O rótulo `line, col` no canto era a única pista do cursor e passava despercebido; o caret elimina a leitura numérica.     |
| 3   | `line, col` mantido como metadado secundário                       | Ainda serve para conferência e para leitores de tela, mas não é mais o canal principal.                                   |
| 4   | **Grupos com `flex: 0 0 auto` e lista com rolagem própria**        | O grupo ativo alto comprimia os colapsados; `overflow: hidden` anulava o tamanho mínimo e cortava ícone e texto.          |
| 5   | **Navegação movida para entre o objetivo e o editor**              | Os botões ficavam depois do painel de resultado, fora da tela em alturas menores; agora ficam no caminho do olhar.        |
| 6   | **Atalhos visíveis nos botões (`<kbd>`) + captura global**         | O usuário não precisava descobrir combinações; a captura garante que funcionem com o editor focado sem o Vim interceptar. |
| 7   | Breakpoint de colapso em 1023px                                    | 1024×700 é o mínimo suportado; colapsar exatamente nele quebrava a promessa de duas colunas.                              |
| 8   | **Box do objetivo com estados verde/âmbar e texto correspondente** | Em tablet o resultado fica abaixo da dobra; acerto e "falta Esc" precisam aparecer onde o usuário está olhando.           |
| 9   | **Aba de estatísticas ao lado de "Limpar dados"**                  | Aproveita os resultados já salvos para mostrar progresso sem criar tela, rota ou schema novo.                             |
| 10  | Diálogo sem fechamento por clique no fundo                         | Um `div` com `click` e sem teclado falha nas regras de acessibilidade; `Esc` e o botão ✕ cobrem o caso.                   |
| 11  | Atalhos inertes enquanto o diálogo está aberto                     | Evita navegar por baixo de um modal e perder o contexto do que está sendo lido.                                           |
| 12  | Orçamento de estilo do componente elevado para 12/16 kB            | O CSS do shell concentra topbar, sidebar, palco e diálogo; o limite anterior disparava por uma feature legítima.          |

O detalhamento técnico de cada item (arquivos, testes e comandos) está no
`docs/spec/Kickoff.md`, seção "Feedback de uso: objetivo, grupos, navegação e
estatísticas".

---

## 8. Diretrizes para evoluir

- **Não introduza um segundo canal de estado.** Se precisar de mais feedback,
  estenda o box do objetivo ou o painel de resultado; não crie um banner.
- **Toda cor de estado precisa de texto.** Verde/âmbar são reforço, não a
  mensagem.
- **Novos atalhos**: modifier que o Vim não use, exibição no botão e
  `aria-keyshortcuts`. Nunca capture teclas sem modificador no `document`.
- **Novos diálogos**: `role="dialog"`, `aria-modal`, foco inicial, devolução de
  foco, `Esc`, e nenhum handler de clique em elemento não focável.
- **Novos painéis**: entram na ordem do palco sem empurrar a navegação para
  baixo do editor.
- **Novos textos**: chave nos dois dicionários; paridade é testada.
- **Novos tamanhos**: verifique 1024×700 e 1280×800; o layout não pode cortar
  grupos nem esconder a navegação.

---

## 9. Verificação de design

O design é verificado por testes, não só por inspeção:

- `e2e/basic.spec.ts` valida:
  - o caret do objetivo presente;
  - a ordem `task-panel → stage-nav → editor-shell`;
  - nenhum `.group` com conteúdo cortado (`scrollHeight ≤ clientHeight`);
  - ícones de grupo com pelo menos 30px;
  - os textos dos atalhos e o comportamento real de `Alt+←`/`Alt+R`/`Alt+→`;
  - o box do objetivo verde após concluir;
  - o diálogo de estatísticas com `1 de 124`, progresso por grupo, fechamento
    por `Esc` e foco devolvido ao gatilho.
- `app.spec.ts` cobre o caret em uma e em várias linhas, o estado verde, o
  estado âmbar e o diálogo (abertura, `role`, conteúdo e inércia dos atalhos).
- `stats.spec.ts` cobre a agregação exibida no diálogo.
- `ng lint` inclui as regras de acessibilidade de template que barraram o clique
  no backdrop.
