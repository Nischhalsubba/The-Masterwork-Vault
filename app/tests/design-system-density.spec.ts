import { expect, test } from '@playwright/test'

const classNames = ['Barbarian', 'Bard', 'Cleric', 'Fighter', 'Paladin', 'Ranger', 'Rogue', 'Warlock', 'Wizard']

test('temporary evidence capture: NW-Hub exposes class artwork URLs', async ({ page }) => {
  await page.goto('https://nw-hub.com/classes', { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.waitForTimeout(2_000)
  const rows = await page.locator('img').evaluateAll((images) =>
    images.map((image) => ({
      src: image.currentSrc || image.getAttribute('src') || '',
      alt: image.getAttribute('alt') || '',
      title: image.getAttribute('title') || '',
      width: image.naturalWidth,
      height: image.naturalHeight,
    })).filter((row) => row.src)
  )
  console.log('NWHUB_CLASS_IMAGES=' + JSON.stringify(rows))
  expect(rows.length).toBeGreaterThan(0)
})

test('catalog uses a compact icon-backed class filter instead of a tall class rail', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/catalog')
  const filter = page.locator('.mw-class-filter')
  await expect(filter).toBeVisible()
  for (const name of classNames) {
    const button = filter.getByRole('button', { name: new RegExp(name, 'i') })
    if (await button.count()) await expect(button.locator('img')).toHaveCount(1)
  }
  const box = await filter.boundingBox()
  expect(box?.height || 999).toBeLessThan(110)
})

test('known crafting level is visible in catalog list and item detail', async ({ page }) => {
  await page.goto('/catalog?q=Crafted%20Potion%20of%20Critical%20Strike%20Rank%2013')
  await expect(page.getByText('Profession level 20').first()).toBeVisible()
  await expect(page.locator('.detail').getByText('Profession level 20')).toBeVisible()
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
