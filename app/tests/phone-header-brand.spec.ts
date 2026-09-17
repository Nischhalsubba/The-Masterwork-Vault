import { expect, test } from '@playwright/test'

for (const width of [320, 390]) {
  test(`phone header brand remains inside its space at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/journey')
    const brand = page.locator('.mobile-v4-brand')
    await expect(brand).toBeVisible()
    const metrics = await brand.evaluate((node) => {
      const title = node.querySelector('strong')!
      const titleBounds = title.getBoundingClientRect()
      const header = node.closest('header')!.getBoundingClientRect()
      const lineHeight = Number.parseFloat(getComputedStyle(title).lineHeight)
      return { overflow: node.scrollWidth - node.clientWidth, titleHeight: titleBounds.height, lineHeight, top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, headerTop: header.top, headerBottom: header.bottom }
    })
    expect(metrics.overflow).toBeLessThanOrEqual(1)
    expect(metrics.titleHeight).toBeLessThanOrEqual(metrics.lineHeight * 2 + 1)
    expect(metrics.top).toBeGreaterThanOrEqual(metrics.headerTop)
    expect(metrics.bottom).toBeLessThanOrEqual(metrics.headerBottom)
    await page.screenshot({ path: testInfo.outputPath(`workspace-phone-header-${width}.png`) })
  })
}
