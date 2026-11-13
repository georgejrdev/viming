# viming — notas

`viming` é um site de prática para quem já usa Vim, mas continua preso a um conjunto pequeno de comandos. Em vez de ler uma lista, você edita um buffer até ele bater com o estado alvo.

## Como uma sessão funciona

1. O app abre no último desafio visitado ou no primeiro da trilha.
2. O editor recebe foco automaticamente. O cronômetro começa na primeira tecla.
3. Toda mudança de estado é validada. Quando buffer, cursor e seleção batem com o objetivo **em normal mode**, o desafio conclui e o resultado aparece.
4. Use a barra lateral para escolher um grupo, as setas para navegar entre desafios ou o botão aleatório para treinar reconhecimento.

`Alt+←` vai para o desafio anterior, `Alt+R` reinicia o atual e `Alt+→` avança — os atalhos aparecem nos botões e funcionam mesmo com o editor em foco.

## O que conta como solução

Só o estado final importa. Se a sua sequência chega ao objetivo, ela passa — mesmo que não seja a sequência que o autor tinha em mente. Por isso a prévia do objetivo mostra o buffer e o cursor exatos.

O cronômetro para no instante da conclusão. O resultado mostra teclas, segundos e a diferença para o par do desafio. O melhor resultado de cada desafio fica salvo.

## Idioma e dados

A interface está disponível em inglês e pt-BR. A primeira visita segue o idioma do navegador (`pt*` abre em pt-BR, o restante em inglês); uma escolha salva vence. “Resetar dados” limpa a preferência de idioma, o último desafio e todos os resultados.

Tudo roda localmente. Não há backend, conta nem telemetria. O progresso vive no `localStorage`; se o navegador bloquear, a sessão continua em memória.

## Cobertura de comandos

O universo fechado tem 114 comandos em seis grupos, com pelo menos um desafio por comando e pelo menos dois para `d`, `c`, `y` e as motions centrais. A lista completa e as emendas de implementação (folds e `:g` foram removidos durante a construção) estão em `docs/spec/SPEC.md`.

## Rodar e verificar

Veja o [README](../../README.md) da raiz para comandos e estrutura do projeto.

## Licença

AGPL-3.0. Veja [LICENSE](../../LICENSE).
