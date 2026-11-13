/**
 * Small authoring helper. Challenge modules stay declarative: they pass text,
 * cursor positions and par values; this helper builds the schema used by the
 * registry and the validators.
 */

function position(value) {
  return Array.isArray(value) ? { line: value[0], ch: value[1] } : value;
}

export function define(row) {
  const {
    id,
    group,
    order,
    command,
    title,
    difficulty = 2,
    text,
    cursor,
    selection,
    historySeed,
    targetText,
    targetCursor,
    targetSelection,
    validate,
    par = 3,
    seconds = 8,
    hint = false,
  } = row;

  const challenge = {
    id: id ?? `${group.toLowerCase()}-${String(order).padStart(2, '0')}-${title}`,
    group,
    order,
    difficulty,
    titleKey: `title.cmd.${title}`,
    taskKey: 'task.reachGoal',
    initial: {
      text,
      cursor: position(cursor),
      ...(selection ? { selection } : {}),
      ...(historySeed ? { historySeed } : {}),
    },
    targetCommand: command,
    par: { keystrokes: par, seconds },
  };

  if (hint) challenge.hintKey = 'hint.generic';

  if (targetText !== undefined) {
    challenge.target = { text: targetText };
    if (targetCursor) challenge.target.cursor = position(targetCursor);
    if (targetSelection) challenge.target.selection = targetSelection;
  }

  if (validate) challenge.validate = validate;

  return challenge;
}

export function buildGroup(group, rows) {
  return rows.map((row, index) => define({ group, order: index + 1, ...row }));
}
