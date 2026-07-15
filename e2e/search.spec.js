import { test, expect } from '@playwright/test';

test.describe('Search functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for dataset to load
    await expect(page.locator('#datasetStatus')).toContainText(/Loaded/i, { timeout: 10000 });
  });

  test('shows all 12 constituencies by default', async ({ page }) => {
    const resultCards = page.locator('.result-card');
    await expect(resultCards).toHaveCount(12);
    await expect(resultCards.nth(0)).toContainText('New Delhi');
    await expect(resultCards.nth(1)).toContainText('Varanasi');
    await expect(resultCards.nth(2)).toContainText('Wayanad');
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
    await searchInput.fill('Modi');
    await page.locator('#searchButton').click();
    const resultCards = page.locator('.result-card');
    await expect(resultCards).toHaveCount(1);
    await expect(resultCards).toContainText('Varanasi');
  });

  test('filters by party name', async ({ page }) => {
    const searchInput = page.locator('#globalSearch');
    await searchInput.fill('Bharatiya Janata Party');
    await page.locator('#searchButton').click();
    const resultCards = page.locator('.result-card');
    await expect(resultCards).toHaveCount(7);
    await expect(resultCards.nth(0)).toContainText('New Delhi');
    await expect(resultCards.nth(1)).toContainText('Varanasi');
  });

  test('scope tabs filter correctly', async ({ page }) => {
    const searchInput = page.locator('#globalSearch');
    await searchInput.fill('Mumbai');

    // All scope
    const allTab = page.locator('.tab[data-scope="all"]');
    const constituencyTab = page.locator('.tab[data-scope="constituency"]');

    await allTab.click();
    await expect(page.locator('.result-card')).toHaveCount(1);

    // Clear search, expect all 12
    await searchInput.fill('');
    await constituencyTab.click();
    await expect(page.locator('.result-card')).toHaveCount(12);
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
    await expect(countChip).toHaveText('12');

    await page.locator('#globalSearch').fill('Pune');
    await page.locator('#searchButton').click();
    await expect(countChip).toHaveText('1');
  });
});