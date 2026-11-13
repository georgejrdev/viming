import { expect, test } from '@playwright/test';
import { SEQUENCES, sendSequence } from './sequences';

test.beforeEach(async ({ context, browserName }) => {
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  }
});

test('every challenge is solvable with its intended keys', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');
  await expect(page.locator('.cm-content')).toBeVisible();

  const challenges = await page.evaluate(() =>
    (
      window as unknown as {
        __viming: {
          challenges: Array<{
            id: string;
            group: string;
            order: number;
            targetCommand: string;
            target?: unknown;
          }>;
        };
      }
    ).__viming.challenges.map((challenge) => ({
      id: challenge.id,
      group: challenge.group,
      order: challenge.order,
      targetCommand: challenge.targetCommand,
      target: challenge.target,
    })),
  );

  const failures: string[] = [];

  for (const challenge of challenges) {
    const key = `${challenge.group}${challenge.order}`;
    const sequence = SEQUENCES[key];
    if (!sequence) {
      failures.push(`${key} ${challenge.id} (${challenge.targetCommand}): missing sequence`);
      continue;
    }

    await page.evaluate((id) => {
      (
        window as unknown as { __viming: { select: (challengeId: string) => void } }
      ).__viming.select(id);
    }, challenge.id);
    await page.waitForTimeout(120);

    await sendSequence(page, sequence);
    await page.waitForTimeout(100);

    const passed = await page.locator('.pass-badge').isVisible();
    if (!passed) {
      const snapshot = await page.evaluate(() =>
        (
          window as unknown as {
            __viming: { snapshot: () => unknown };
          }
        ).__viming.snapshot(),
      );
      failures.push(
        `${key} ${challenge.id} (${challenge.targetCommand}) seq=${sequence}\n  actual=${JSON.stringify(
          snapshot,
        )}\n  target=${JSON.stringify(challenge.target)}`,
      );
    }
  }

  expect(failures, failures.join('\n\n')).toEqual([]);
});
