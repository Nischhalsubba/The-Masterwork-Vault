import { expect, test } from '@playwright/test'

for (const width of [768, 1024]) {
  test(`all standalone workspaces clear the tablet navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['journey', 'readiness', 'data-health', 'explore', 'graph']) {
      await page.goto(`/${route}`)
      const rail = page.getByRole('complementary', { name: 'Workspace navigation' })
      const main = page.getByRole('main')
      await expect(main).toBeVisible()
      await expect(rail).toBeVisible()
      const navBounds = await rail.boundingBox()
      const contentBounds = await main.boundingBox()
      expect(contentBounds!.x, `${route} starts beneath the navigation`).toBeGreaterThanOrEqual(navBounds!.x + navBounds!.width)
      expect(contentBounds!.x + contentBounds!.width, `${route} exceeds the viewport`).toBeLessThanOrEqual(width + 1)
      const heading = await main.getByRole('heading').first().boundingBox()
      expect(heading!.x).toBeGreaterThan(navBounds!.x + navBounds!.width)
    }
  })
}
