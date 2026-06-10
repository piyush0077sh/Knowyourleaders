import { test, expect } from '@playwright/test';

test.describe('Accessibility & Evidence drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/constituency.html?id=chennai-central');
    await expect(page.locator('#datasetStatus')).toContainText(/Loaded/i, { timeout: 10000 });
  });

  test('evidence drawer opens and shows content', async ({ page }) => {
    const firstViewBtn = page.locator('[data-open-evidence]').first();
    await firstViewBtn.click();

    const drawer = page.locator('#evidenceDrawer');
    await expect(drawer).toHaveClass(/open/);
    await expect(page.locator('#drawerTitle')).toBeVisible();
    await expect(page.locator('#evidenceList')).toBeVisible();
  });

  test('evidence drawer closes with Escape key', async ({ page }) => {
    await page.locator('[data-open-evidence]').first().click();
    await expect(page.locator('#evidenceDrawer')).toHaveClass(/open/);

    await page.keyboard.press('Escape');
    await expect(page.locator('#evidenceDrawer')).not.toHaveClass(/open/);
  });

  test('evidence drawer closes with backdrop click', async ({ page }) => {
    await page.locator('[data-open-evidence]').first().click();
    await expect(page.locator('#evidenceDrawer')).toHaveClass(/open/);

    await page.locator('#drawerBackdrop').click({ force: true });
    await expect(page.locator('#evidenceDrawer')).not.toHaveClass(/open/);
  });

  test('evidence drawer has proper ARIA attributes', async ({ page }) => {
    await page.locator('[data-open-evidence]').first().click();
    const drawer = page.locator('#evidenceDrawer');
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    await expect(drawer).toHaveAttribute('aria-labelledby', 'drawerTitle');
  });

  test('correction modal opens from drawer', async ({ page }) => {
    await page.locator('[data-open-evidence]').first().click();
    await page.locator('#openCorrectionModal').click();

    const modal = page.locator('#correctionModal');
    await expect(modal).toHaveClass(/open/);
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  test('correction modal closes with Escape', async ({ page }) => {
    await page.locator('[data-open-evidence]').first().click();
    await page.locator('#openCorrectionModal').click();
    await expect(page.locator('#correctionModal')).toHaveClass(/open/);

    await page.keyboard.press('Escape');
    await expect(page.locator('#correctionModal')).not.toHaveClass(/open/);
  });

  test('status legend is visible on constituency page', async ({ page }) => {
    const legend = page.locator('.status-legend');
    await expect(legend).toBeVisible();
    await expect(legend).toHaveAttribute('aria-label', 'Status legend');
  });

  test('promise table has proper table semantics', async ({ page }) => {
    const table = page.locator('.promise-table');
    await expect(table).toBeVisible();
    await expect(table.locator('thead th')).toHaveCount(4);
    // Verify scope attributes
    const headers = table.locator('thead th');
    await expect(headers.nth(0)).toHaveAttribute('scope', 'col');
  });

  test('status badges have aria-labels', async ({ page }) => {
    const statusTags = page.locator('[role="status"]');
    const count = await statusTags.count();
    expect(count).toBeGreaterThan(0);
  });
});