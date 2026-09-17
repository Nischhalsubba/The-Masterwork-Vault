import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`readiness action focuses the visible profession editor at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/readiness')
    await page.locator('.mw-priority-list > li').filter({ hasText: 'Alchemy' }).getByRole('button').click()
    const input = page.getByRole('spinbutton', { name: 'Alchemy level', exact: true })
    await expect(input).toBeFocused()
    await expect(input).toBeInViewport()
  })
}
