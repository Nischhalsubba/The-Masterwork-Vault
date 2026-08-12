import { expect, test } from '@playwright/test'

test('Journey desktop layout uses the workspace and keeps hero metadata separated', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'phone', 'Desktop layout regression')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/journey')

  const main = page.locator('.journey-page-main')
  await expect(main).toBeVisible()
  const mainBox = await main.boundingBox()
  expect(mainBox).not.toBeNull()
  expect(mainBox!.width).toBeGreaterThan(1300)

  const back = await page.getByRole('link', { name: 'Back to Catalog' }).boundingBox()
  const eyebrow = await page.locator('.journey-page-hero .journey-eyebrow').boundingBox()
  expect(back).not.toBeNull()
  expect(eyebrow).not.toBeNull()
  expect(back!.x + back!.width).toBeLessThan(eyebrow!.x)

  const taskFontSize = await page.locator('.journey-task p').first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))
  expect(taskFontSize).toBeGreaterThanOrEqual(13)
})
