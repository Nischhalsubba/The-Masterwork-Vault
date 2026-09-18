import { expect, test } from '@playwright/test'

test('Journey desktop layout lives inside the unified workspace shell', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'phone', 'Desktop layout regression')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/journey')

  const rail = page.locator('.tablet-v4-sidebar')
  const main = page.locator('.journey-page-main')
  await expect(rail).toBeVisible()
  await expect(main).toBeVisible()
  await expect(page.locator('.journey-page-topbar')).toBeHidden()
  await expect(page.getByRole('link', { name: 'Back to Catalog' })).toBeHidden()

  const railBox = await rail.boundingBox()
  const mainBox = await main.boundingBox()
  expect(railBox).not.toBeNull()
  expect(mainBox).not.toBeNull()
  expect(mainBox!.x).toBeGreaterThanOrEqual(railBox!.x + railBox!.width)
  expect(mainBox!.x + mainBox!.width).toBeLessThanOrEqual(1441)

  const eyebrow = await page.locator('.journey-page-hero .journey-eyebrow').boundingBox()
  expect(eyebrow).not.toBeNull()

  const taskFontSize = await page.locator('.journey-task p').first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))
  expect(taskFontSize).toBeGreaterThanOrEqual(13)
})
