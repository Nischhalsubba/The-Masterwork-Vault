import { expect, test } from '@playwright/test'

const routes = ['/catalog', '/plan', '/materials', '/journey', '/reference', '/readiness', '/explore', '/graph', '/data-health']

for (const route of routes) {
  for (const width of [390, 768]) {
    test(`route ${route} fits the viewport at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(route)
      await expect(page.locator('#main-content')).toBeVisible()
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        page: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      }))
      expect(dimensions.page - dimensions.viewport, 'Horizontal overflow: ' + route).toBeLessThanOrEqual(1)
      expect(dimensions.height).toBeGreaterThan(100)
      await page.screenshot({ path: testInfo.outputPath('acquisition-responsive-' + route.slice(1) + '-' + width + '.png'), fullPage: false })
    })
  }
}
