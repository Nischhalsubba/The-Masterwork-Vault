import { expect, test } from '@playwright/test'

test('phone catalog defers offscreen class emblem requests', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const requested = new Set<string>()
  page.on('request', request => {
    if (/https:\/\/nw-hub\.com\/assets\/classes\/emblems\/.+\.webp/.test(request.url())) {
      requested.add(request.url())
    }
  })
  await page.goto('/catalog/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.mw-class-filter')).toBeVisible()
  await page.waitForTimeout(900)
  expect(requested.size, 'avoid eagerly downloading all nine 300px class emblems on narrow mobile').toBeLessThan(9)
})
