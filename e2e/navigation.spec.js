import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#datasetStatus')).toContainText(/Loaded/i, { timeout: 10000 });
  });

  test('clicking View Evidence link navigates to constituency page', async ({ page }) => {
    const firstLink = page.locator('.result-card a').first();
    await firstLink.click();
    await expect(page).toHaveURL(/constituency\.html/);
    await expect(page.locator('#constituencyHeading')).toBeVisible();
  });

  test('constituency page shows heading, metrics and promise table', async ({ page }) => {
    await page.goto('/constituency.html?id=chennai-central');
    await expect(page.locator('#datasetStatus')).toContainText(/Loaded/i, { timeout: 10000 });

    await expect(page.locator('#constituencyHeading')).toContainText('Chennai Central');
    await expect(page.locator('#promiseScore')).toBeVisible();
    await expect(page.locator('#impactScore')).toBeVisible();
    await expect(page.locator('#promiseTableBody')).toBeVisible();
  });

  test('constituency switcher changes page', async ({ page }) => {
    await page.goto('/constituency.html?id=chennai-central');
    await expect(page.locator('#datasetStatus')).toContainText(/Loaded/i, { timeout: 10000 });

    await page.locator('#constituencySelect').selectOption('mumbai-south');
    await expect(page).toHaveURL(/id=mumbai-south/);
    await expect(page.locator('#constituencyHeading')).toContainText('Mumbai South');
  });

  test('Home link in constituency page navigates back', async ({ page }) => {
    await page.goto('/constituency.html?id=chennai-central');
    await page.locator('a[href="./index.html"]').first().click();
    await expect(page).toHaveURL(/index\.html/);
  });

  test('all 3 constituency pages are reachable', async ({ page }) => {
    const ids = ['chennai-central', 'mumbai-south', 'pune'];
    for (const id of ids) {
      await page.goto(`/constituency.html?id=${id}`);
      await expect(page.locator('#datasetStatus')).toContainText(/Loaded/i, { timeout: 10000 });
      await expect(page.locator('#promiseTableBody')).toBeVisible();
    }
  });
});