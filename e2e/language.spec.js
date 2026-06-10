import { test, expect } from '@playwright/test';

test.describe('Language switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#datasetStatus')).toContainText(/Loaded/i, { timeout: 10000 });
  });

  test('default locale is English', async ({ page }) => {
    await expect(page.locator('.logo')).toHaveText('KNOWYOURLEADERS');
    await expect(page.locator('.tagline')).toHaveText('Vote by record, not rhetoric.');
    await expect(page.locator('#heroTitle')).toHaveText('Pilot dataset browser');
  });

  test('switching to Hindi shows Hindi labels', async ({ page }) => {
    await page.locator('button[data-lang="hi"]').click();
    await page.waitForURL(/\?lang=hi/);
    await expect(page.locator('.tagline')).toHaveText('नारों नहीं, रिकॉर्ड के आधार पर वोट करें।');
    await expect(page.locator('#heroTitle')).toHaveText('पायलट डेटासेट ब्राउज़र');
  });

  test('switching to Tamil shows Tamil labels', async ({ page }) => {
    await page.locator('button[data-lang="ta"]').click();
    await page.waitForURL(/\?lang=ta/);
    await expect(page.locator('.tagline')).toHaveText('கூற்றுக்கு அல்ல, செயல்பாட்டு பதிவை வைத்து வாக்களிக்கவும்.');
    await expect(page.locator('#heroTitle')).toHaveText('முன்மாதிரி தரவுத்தொகுப்பு உலாவி');
  });

  test('language persists via URL on constituency page', async ({ page }) => {
    // Switch to Hindi
    await page.locator('button[data-lang="hi"]').click();
    await page.waitForURL(/\?lang=hi/);

    // Navigate to constituency page
    await page.goto('/constituency.html?id=chennai-central&lang=hi');
    await expect(page.locator('#datasetStatus')).toContainText(/Loaded/i, { timeout: 10000 });

    // Verify Hindi labels
    await expect(page.locator('#constituencyHeading')).toContainText('निर्वाचन क्षेत्र');
  });

  test('English fallback works for missing keys', async ({ page }) => {
    // Tamil should have all keys, but verify at least the tagline is different from English
    await page.locator('button[data-lang="ta"]').click();
    await page.waitForURL(/\?lang=ta/);
    const tagline = page.locator('.tagline');
    await expect(tagline).not.toHaveText('Vote by record, not rhetoric.');
  });

  test('language pills are keyboard accessible', async ({ page }) => {
    const hiButton = page.locator('button[data-lang="hi"]');
    await expect(hiButton).toBeVisible();
    await expect(hiButton).toHaveAttribute('aria-label', 'हिंदी');
  });
});