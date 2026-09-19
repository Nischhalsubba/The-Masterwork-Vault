import { expect, test } from '@playwright/test'

const classNames = ['Barbarian', 'Bard', 'Cleric', 'Fighter', 'Paladin', 'Ranger', 'Rogue', 'Warlock', 'Wizard']

test('catalog uses a compact NW-Hub icon-backed class filter instead of a tall class rail', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/catalog')
  const filter = page.locator('.mw-class-filter')
  await expect(filter).toBeVisible()

  for (const name of classNames) {
    const button = filter.getByRole('button', { name: new RegExp(name, 'i') })
    await expect(button).toBeVisible()
    const image = button.locator('img')
    await expect(image).toHaveCount(1)
    await expect(image).toHaveAttribute('src', new RegExp('^https://nw-hub\\.com/assets/classes/emblems/' + name.toLowerCase() + '\\.webp$'))
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true)
  }

  const box = await filter.boundingBox()
  expect(box?.height || 999).toBeLessThan(110)
})

test('known crafting level is visible in catalog list, item detail and details drawer', async ({ page }) => {
  const name = 'Crafted Potion of Critical Strike Rank 13'
  await page.goto('/catalog?campaign=Sharandar&q=' + encodeURIComponent(name))
  const row = page.locator('.catalog .items .item-main').filter({ hasText: name }).first()
  await expect(row).toBeVisible()
  await expect(row.getByText('Profession level 20')).toBeVisible()

  await row.click()
  await expect(page.locator('.detail .mw-detail-requirement .verified').filter({ hasText: 'Profession level 20' })).toBeVisible()

  const details = page.getByRole('button', { name: /Details/ })
  if (await details.isVisible()) {
    await details.click()
    await expect(page.getByRole('dialog')).toContainText('Profession level 20')
  }
})

test('wide catalog uses available workspace width without a 1500px dead-space cap', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/catalog')
  const main = page.locator('.app > main')
  const catalog = page.locator('.catalog')
  const mainBox = await main.boundingBox()
  const catalogBox = await catalog.boundingBox()
  expect(mainBox).not.toBeNull()
  expect(catalogBox).not.toBeNull()
  expect((catalogBox?.width || 0) / (mainBox?.width || 1)).toBeGreaterThan(0.95)
})

test('recipe graph cards use the graph canvas width on wide screens', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/graph')
  const canvas = page.locator('.mw-graph-canvas')
  const firstCard = page.locator('.mw-graph-card').first()
  await expect(firstCard).toBeVisible()
  const canvasBox = await canvas.boundingBox()
  const cardBox = await firstCard.boundingBox()
  expect((cardBox?.width || 0) / (canvasBox?.width || 1)).toBeGreaterThan(0.75)
})

test('phone retains compare access while class filtering remains horizontally compact', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 })
  await page.goto('/catalog')
  await expect(page.getByRole('button', { name: 'Compare items', exact: true })).toBeVisible()
  const filter = page.locator('.mw-class-filter')
  await expect(filter).toBeVisible()
  const box = await filter.boundingBox()
  expect(box?.height || 999).toBeLessThan(80)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})
