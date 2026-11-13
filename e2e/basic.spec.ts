import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

test('loads, focuses the editor and completes the first challenge', async ({ page }) => {
  await page.goto('/');

  const editor = page.locator('.cm-content');
  await expect(editor).toBeVisible();
  await expect(editor).toBeFocused();
  await expect(page.locator('.goal-text')).toContainText('abcdef');

  // The goal preview marks the target cursor; the `line, col` label alone is
  // too easy to miss.
  await expect(page.locator('.goal-caret')).toHaveCount(1);
  await expect(page.locator('.goal')).not.toHaveClass(/success/);

  await page.keyboard.press('h');

  await expect(page.locator('.pass-badge')).toBeVisible();
  await expect(page.locator('.announcement')).toContainText(/complete|concluído/i);
  // The result panel can be below the fold on tablets, so the goal box itself
  // must confirm the pass.
  await expect(page.locator('.goal')).toHaveClass(/success/);
  await expect(page.locator('.goal-help')).toContainText(/complete|concluído/i);
});

test('keeps navigation above the editor and every group readable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.cm-content')).toBeVisible();

  // Order: goal panel, prev/restart/next, editor.
  const order = await page
    .locator('.stage > *')
    .evaluateAll((nodes) => nodes.map((node) => node.className));
  expect(order[0]).toContain('task-panel');
  expect(order[1]).toContain('stage-nav');
  expect(order[2]).toContain('editor-shell');

  // Flex shrinking used to clip the collapsed groups when the active one was
  // tall; no group may hide its own content.
  const clipped = await page
    .locator('.group')
    .evaluateAll(
      (nodes) => nodes.filter((node) => node.scrollHeight > node.clientHeight + 1).length,
    );
  expect(clipped).toBe(0);

  const icons = await page
    .locator('.group-letter')
    .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
  expect(icons.every((height) => height >= 30)).toBe(true);
});

test('keeps the language when switching challenges', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'PT-BR' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('h1')).toHaveText('viming');
  await expect(page.locator('.sidebar')).toContainText('Fundamentos');

  await page.getByRole('button', { name: /Próximo/ }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('.cm-content')).toBeFocused();
});

test('shows and honours the navigation shortcuts', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.goal-text')).toContainText('abcdef');

  const nav = page.locator('.stage-nav');
  await expect(nav.locator('kbd')).toHaveText(['Alt+←', 'Alt+R', 'Alt+→']);
  await expect(nav.locator('button').first()).toHaveAttribute('aria-keyshortcuts', 'Alt+ArrowLeft');

  await page.keyboard.press('Alt+ArrowRight');
  await expect(page.locator('.goal-text')).toContainText('alpha');

  await page.keyboard.press('Alt+ArrowLeft');
  await expect(page.locator('.goal-text')).toContainText('abcdef');
  await expect(page.locator('.cm-content')).toBeFocused();

  // Completing and then restarting must clear the result panel.
  await page.keyboard.press('h');
  await expect(page.locator('.pass-badge')).toBeVisible();

  await page.keyboard.press('Alt+r');
  await expect(page.locator('.pass-badge')).toHaveCount(0);
  await expect(page.locator('.goal-text')).toContainText('abcdef');
});

test('shows saved progress in the statistics dialog', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('h');
  await expect(page.locator('.pass-badge')).toBeVisible();

  const open = page.getByRole('button', { name: 'Open statistics' });
  await open.click();

  const dialog = page.getByRole('dialog', { name: 'Statistics' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('1 of 124 challenges');
  await expect(dialog.locator('.stats-card').first()).toContainText('1/124');
  await expect(dialog.locator('.group-stats li').first()).toContainText('1/45');

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  // Focus goes back to the trigger so keyboard users are not dropped on body.
  await expect(open).toBeFocused();
});
