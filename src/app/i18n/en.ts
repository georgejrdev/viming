import { COMMAND_CATALOG } from '../core/command.catalog';

/** Command titles are language-neutral, so both dictionaries share them. */
const commandTitles = Object.fromEntries(
  COMMAND_CATALOG.map((command) => [`title.cmd.${command.key}`, command.label]),
);

export const en = {
  ...commandTitles,

  'app.title': 'viming',
  'app.tagline': 'Practise the Vim commands you already know but never use.',

  'header.language': 'Language',
  'header.reset': 'Reset data',
  'header.resetDone': 'Saved data cleared.',
  'header.stats': 'Statistics',
  'header.statsOpen': 'Open statistics',

  'stats.eyebrow': 'Your training so far',
  'stats.title': 'Statistics',
  'stats.close': 'Close statistics',
  'stats.progress': '{done} of {total} challenges',
  'stats.attempts': 'Attempts',
  'stats.completed': 'Completed',
  'stats.averageKeystrokes': 'Average keys',
  'stats.averageSeconds': 'Average time',
  'stats.fastest': 'Fastest solve',
  'stats.fewestKeys': 'Leanest solve',
  'stats.byGroup': 'Progress by group',
  'stats.empty': 'Complete a challenge to start tracking your progress.',
  'stats.keysValue': '{keys} keys',
  'stats.secondsValue': '{seconds}s',

  'nav.groups': 'Groups',
  'nav.group.A': 'Fundamentals',
  'nav.group.B': 'Operators and text objects',
  'nav.group.C': 'Search and jumps',
  'nav.group.D': 'Visual mode and registers',
  'nav.group.E': 'Macros and marks',
  'nav.group.F': 'Ex commands',
  'nav.group.A.description': 'Motions, insertions and the everyday edits.',
  'nav.group.B.description': 'Operators, text objects and line operations.',
  'nav.group.C.description': 'Searches, character jumps and viewport motions.',
  'nav.group.D.description': 'Selections, visual mode and registers.',
  'nav.group.E.description': 'Record, replay and jump to marks.',
  'nav.group.F.description': 'Substitute, move, copy and run normal commands.',
  'nav.random': 'Random challenge',
  'nav.prev': 'Previous',
  'nav.next': 'Next',
  'nav.restart': 'Restart challenge',
  'nav.progress': '{done}/{total}',

  'task.title': 'Task',
  'task.command': 'Command',
  'task.par': 'Par',
  'task.parValue': '{keystrokes} keys · {seconds}s',
  'task.goal': 'Goal',
  'task.goalHint': 'Make the buffer and cursor match this goal.',
  'task.goalDone': 'Goal reached. Challenge complete.',
  'task.noGoal': 'Follow the instruction and finish in normal mode.',
  'task.hint': 'Hint',
  'task.showHint': 'Show hint',
  'task.hideHint': 'Hide hint',
  'task.reachGoal': 'Edit the buffer with Vim keys until it matches the goal.',

  'editor.label': 'Vim practice editor',
  'editor.help':
    'The editor starts in normal mode. Arrows, Page Up/Down and the mouse are disabled on purpose; use Vim motions.',

  'result.title': 'Result',
  'result.idle': 'Make a change to start the clock.',
  'result.pass': 'Challenge complete.',
  'result.notNormal': 'Goal reached, but finish with Esc to complete in normal mode.',
  'result.keystrokes': 'Keystrokes',
  'result.time': 'Time',
  'result.par': 'Par',
  'result.keystrokesDelta': 'Keys vs par',
  'result.timeDelta': 'Time vs par',
  'result.best': 'Best',
  'result.attempts': 'Attempts',
  'result.bestValue': '{keystrokes} keys · {seconds}s',

  'common.group': 'Group',
  'common.difficulty': 'Difficulty',
  'common.challenge': 'Challenge',
  'common.storageUnavailable':
    'Local storage is unavailable; progress will last only for this session.',

  'hint.generic':
    'Reset and try again if the state drifts. The goal preview shows the exact final buffer and cursor.',
};

export type Dictionary = Record<string, string>;
