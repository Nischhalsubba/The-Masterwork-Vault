import { expect, test } from '@playwright/test'

test('desktop routes share one authoritative vault workspace rail', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const path of ['/catalog', '/plan', '/materials', '/journey']) {
    await page.goto(path)
    const rail = page.locator('.mw-workspace-sidebar')
    await expect(rail).toBeVisible()
    const box = await rail.boundingBox()
    expect(box?.width || 0).toBeGreaterThanOrEqual(210)

    const main = path === '/journey' ? page.locator('.journey-page-main') : page.locator('.app > main')
    const mainBox = await main.boundingBox()
    expect(mainBox?.x || 0).toBeGreaterThanOrEqual((box?.width || 0) - 2)
  }
})

test('catalog keeps list and detail as one dense crafting workspace', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/catalog?campaign=Sharandar')

  const firstRow = page.locator('.catalog .items article').first()
  await expect(firstRow).toBeVisible()
  await firstRow.locator('.item-main').click()

  const selected = page.locator('.catalog .items article.selected')
  const detail = page.locator('.catalog .detail')
  await expect(selected).toHaveCount(1)
  await expect(detail).toBeVisible()

  const listBox = await page.locator('.catalog .items').boundingBox()
  const detailBox = await detail.boundingBox()
  expect(listBox).not.toBeNull()
  expect(detailBox).not.toBeNull()
  expect((detailBox?.x || 0)).toBeGreaterThan((listBox?.x || 0) + (listBox?.width || 0) - 2)
})

test('materials uses a browser plus intelligence workspace on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/materials')

  const browser = page.locator('.materials-browser')
  const intelligence = page.locator('.material-intelligence')
  await expect(browser).toBeVisible()
  await expect(intelligence).toBeVisible()

  const browserBox = await browser.boundingBox()
  const intelligenceBox = await intelligence.boundingBox()
  expect(browserBox).not.toBeNull()
  expect(intelligenceBox).not.toBeNull()
  expect(intelligenceBox?.x || 0).toBeGreaterThan((browserBox?.x || 0) + (browserBox?.width || 0) - 2)
})

test('progression keeps chapter navigation beside reading content on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/journey')

  const chapters = page.locator('.journey-chapter-nav')
  const content = page.locator('.journey-chapter')
  await expect(chapters).toBeVisible()
  await expect(content).toBeVisible()

  const chaptersBox = await chapters.boundingBox()
  const contentBox = await content.boundingBox()
  expect(chaptersBox).not.toBeNull()
  expect(contentBox).not.toBeNull()
  expect(contentBox?.x || 0).toBeGreaterThan((chaptersBox?.x || 0) + (chaptersBox?.width || 0) - 2)
})

test('revamped core routes remain free of horizontal page overflow on phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  for (const path of ['/catalog', '/plan', '/materials', '/journey']) {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, path).toBeLessThanOrEqual(1)
  }
})
