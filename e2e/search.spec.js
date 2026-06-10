import { test, expect } from '@playwright/test';

test.describe('Search functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for dataset to load
    await expect(page.locator('#datasetStatus')).toContainText(/Loaded/i, { timeout: 10000 });
  });

  test('shows all 3 pilot constituencies by default', async ({ page }) => {
    const resultCards = page.locator('.result-card');
    await expect(resultCards).toHaveCount(3);
    await expect(resultCards.nth(0)).toContainText('Chennai Central');
    await expect(resultCards.nth(1)).toContainText('Mumbai South');
    await expect(resultCards.nth(2)).toContainText('Pune');
  });

  test('filters by constituency name', async ({ page }) => {
    const searchInput = page.locator('#globalSearch');
    await searchInput.fill('Mumbai');
    await page.locator('#searchButton').click();
    const resultCards = page.locator('.result-card');
    await expect(resultCards).toHaveCount(1);
    await expect(resultCards).toContainText('Mumbai South');
  });

  test('filters by representative name', async ({ page }) => {
    const searchInput = page.locator('#globalSearch');
    await searchInput.fill('Chennai');
    await page.locator('#searchButton').click();
    const resultCards = page.locator('.result-card');
    await expect(resultCards).toHaveCount(1);
    await expect(resultCards).toContainText('Chennai Central');
  });

  test('filters by party name', async ({ page }) => {
    const searchInput = page.locator('#globalSearch');
    await searchInput.fill('Civic Reform');
    await page.locator('#searchButton').click();
    const resultCards = page.locator('.result-card');
    await expect(resultCards).toHaveCount(2);
    await expect(resultCards.nth(0)).toContainText('Mumbai South');
    await expect(resultCards.nth(1)).toContainText('Pune');
  });

  test('scope tabs filter correctly', async ({ page }) => {
    const searchInput = page.locator('#globalSearch');
    await searchInput.fill('Mumbai');

    // All scope
    const allTab = page.locator('.tab[data-scope="all"]');
    const constituencyTab = page.locator('.tab[data-scope="constituency"]');

    await allTab.click();
    await expect(page.locator('.result-card')).toHaveCount(1);

    // Clear search, expect all
    await searchInput.fill('');
    await constituencyTab.click();
    await expect(page.locator('.result-card')).toHaveCount(3);
  });

  test('no results shows empty state', async ({ page }) => {
    const searchInput = page.locator('#globalSearch');
    await searchInput.fill('zzzznonexistent');
    await page.locator('#searchButton').click();
    const resultCards = page.locator('.result-card');
    await expect(resultCards).toHaveCount(0);
    await expect(page.locator('#searchResults')).toContainText(/No records found/i);
  });

  test('results count badge updates', async ({ page }) => {
    const countChip = page.locator('#resultsCount');
    await expect(countChip).toHaveText('3');

    await page.locator('#globalSearch').fill('Pune');
    await page.locator('#searchButton').click();
    await expect(countChip).toHaveText('1');
  });
});