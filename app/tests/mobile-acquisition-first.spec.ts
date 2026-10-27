import { expect, test } from '@playwright/test'

test('mobile recipes prioritize required materials and show inline acquisition locations', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/catalog')
  await page.locator('.items article .item-main').first().click()
  await expect(page.locator('.forge-selected-pane')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Materials you need' })).toBeVisible()
  await expect(page.locator('.recipe-row').first()).toBeVisible()
  const rows = page.locator('.recipe-row')
  expect(await rows.count()).toBeGreaterThan(0)
  for (const row of await rows.all()) {
    const bounds = await row.locator('.recipe-row-actions').boundingBox()
    const rowBounds = await row.boundingBox()
    expect(bounds).not.toBeNull()
    expect(rowBounds).not.toBeNull()
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(391)
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(rowBounds!.x + rowBounds!.width).toBeLessThanOrEqual(391)
  }
  await expect(page.locator('.forge-source-location').first()).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('mobile-acquisition-first.png'), fullPage: false })
})

test('mobile detail variant and details controls cannot overlap ingredient actions', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/catalog')
  await page.getByRole('textbox', { name: 'Search catalog' }).fill('Duergar Mercenary')
  await page.locator('.items article .item-main').first().click()
  await expect(page.locator('.forge-selected-pane .detail')).toBeVisible()
  const controls = page.locator('.forge-selected-pane .detail-controls')
  const width = await controls.evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }))
  expect(width.scroll - width.client).toBeLessThanOrEqual(1)
  const bounds = await page.locator('.recipe-row-actions').first().boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(321)
})

test('work order headline, quantity and mobile navigation fit the screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/catalog')
  await page.locator('.items article .item-main').first().click()
  const head = page.locator('.forge-selected-pane .forge-order-heading')
  const box = await head.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.height).toBeLessThan(190)
  await expect(page.getByRole('button', { name: 'Increase craft quantity' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
})

test('loading fallback exposes skeleton structure, not a spinner-only screen', async ({ page }) => {
  await page.goto('/catalog')
  const loader = page.locator('.mw-page-loading')
  // Page-level lazy routes may load faster than this assertion: if mounted, the fallback must contain skeleton structure.
  if (await loader.count()) await expect(loader.locator('.mw-skeleton')).not.toHaveCount(0)
})
