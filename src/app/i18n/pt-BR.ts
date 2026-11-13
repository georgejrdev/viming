import { COMMAND_CATALOG } from '../core/command.catalog';
import type { Dictionary } from './en';

/** Command titles are language-neutral, so both dictionaries share them. */
const commandTitles = Object.fromEntries(
  COMMAND_CATALOG.map((command) => [`title.cmd.${command.key}`, command.label]),
);

export const ptBR = {
  ...commandTitles,

  'app.title': 'viming',
  'app.tagline': 'Pratique os comandos do Vim que você já conhece, mas nunca usa.',

  'header.language': 'Idioma',
  'header.reset': 'Limpar dados',
  'header.resetDone': 'Dados salvos apagados.',
  'header.stats': 'Estatísticas',
  'header.statsOpen': 'Abrir estatísticas',

  'stats.eyebrow': 'Seu treino até agora',
  'stats.title': 'Estatísticas',
  'stats.close': 'Fechar estatísticas',
  'stats.progress': '{done} de {total} desafios',
  'stats.attempts': 'Tentativas',
  'stats.completed': 'Concluídos',
  'stats.averageKeystrokes': 'Média de teclas',
  'stats.averageSeconds': 'Tempo médio',
  'stats.fastest': 'Resolução mais rápida',
  'stats.fewestKeys': 'Menos teclas',
  'stats.byGroup': 'Progresso por grupo',
  'stats.empty': 'Conclua um desafio para começar a registrar seu progresso.',
  'stats.keysValue': '{keys} teclas',
  'stats.secondsValue': '{seconds}s',

  'nav.groups': 'Grupos',
  'nav.group.A': 'Fundamentos',
  'nav.group.B': 'Operadores e text objects',
  'nav.group.C': 'Busca e saltos',
  'nav.group.D': 'Modo visual e registradores',
  'nav.group.E': 'Macros e marks',
  'nav.group.F': 'Comandos Ex',
  'nav.group.A.description': 'Motions, inserções e edições do dia a dia.',
  'nav.group.B.description': 'Operadores, text objects e operações de linha.',
  'nav.group.C.description': 'Buscas, saltos por caractere e motions de tela.',
  'nav.group.D.description': 'Seleções, modo visual e registradores.',
  'nav.group.E.description': 'Grave, reproduza e salte para marks.',
  'nav.group.F.description': 'Substitua, mova, copie e execute comandos normais.',
  'nav.random': 'Desafio aleatório',
  'nav.prev': 'Anterior',
  'nav.next': 'Próximo',
  'nav.restart': 'Reiniciar desafio',
  'nav.progress': '{done}/{total}',

  'task.title': 'Tarefa',
  'task.command': 'Comando',
  'task.par': 'Par',
  'task.parValue': '{keystrokes} teclas · {seconds}s',
  'task.goal': 'Objetivo',
  'task.goalHint': 'Faça o buffer e o cursor ficarem iguais a este objetivo.',
  'task.goalDone': 'Objetivo atingido. Desafio concluído.',
  'task.noGoal': 'Siga a instrução e termine em modo normal.',
  'task.hint': 'Dica',
  'task.showHint': 'Mostrar dica',
  'task.hideHint': 'Ocultar dica',
  'task.reachGoal': 'Edite o buffer com teclas do Vim até ele ficar igual ao objetivo.',

  'editor.label': 'Editor de prática Vim',
  'editor.help':
    'O editor começa em modo normal. Setas, Page Up/Down e o mouse ficam desativados de propósito; use motions do Vim.',

  'result.title': 'Resultado',
  'result.idle': 'Faça uma alteração para iniciar o cronômetro.',
  'result.pass': 'Desafio concluído.',
  'result.notNormal': 'Objetivo atingido, mas termine com Esc para concluir em modo normal.',
  'result.keystrokes': 'Teclas',
  'result.time': 'Tempo',
  'result.par': 'Par',
  'result.keystrokesDelta': 'Teclas vs par',
  'result.timeDelta': 'Tempo vs par',
  'result.best': 'Melhor',
  'result.attempts': 'Tentativas',
  'result.bestValue': '{keystrokes} teclas · {seconds}s',

  'common.group': 'Grupo',
  'common.difficulty': 'Dificuldade',
  'common.challenge': 'Desafio',
  'common.storageUnavailable':
    'O armazenamento local não está disponível; o progresso dura apenas esta sessão.',

  'hint.generic':
    'Reinicie e tente de novo se o estado sair do lugar. A prévia do objetivo mostra o buffer e o cursor finais.',
} satisfies Dictionary;
